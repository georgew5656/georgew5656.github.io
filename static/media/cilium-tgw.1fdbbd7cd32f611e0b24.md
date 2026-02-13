This blog post covers an interesting problem I discovered a while back when trying to setup multiple Kubernetes clusters running in AWS in a Cilium cluster mesh. The problem covers the whole networking stack and is a pretty interesting example of what can go wrong in cloud networking.

## Background

### MTU

The largest packet a IP network link can carry without breaking it up.

- Standard Ethernet: **1,500 bytes**
- AWS EC2 (jumbo frames): **9,001 bytes**
- AWS Transit Gateway: **8,500 bytes**

When every link in a path has the same MTU, everything works as expected. If any link has a different MTU, problems can arise.

### Transit Gateway

Transit Gateway is a AWS service that supports networking between VPCs. It attempts to replace two existing components.

- VPC Peering, a managed service in AWS that effectively groups two VPCs into a single virtual network where every IP in either network is visible to any other IP in either network. IP range of the two VPCs cannot overlap. This is akin to adding a router between two private networks with static routes for each private range.
- VPN tunnels, which can be managed by AWS or run on servers in each of the VPCs that need to be connected.

```jsx
  ┌───────┐         ┌───────┐
  │ VPC A │◄═══════►│ VPC B │
  └──┬──┬─┘         └─┬──┬──┘
     │  │    Peering/VPN   │  │
     │  └──────────────┘  │
     │  ┌─────────────────┘
     │  │    Peering/VPN
  ┌──┴──┴─┐         ┌───────┐
  │ VPC C │◄═══════►│ VPC D │
  └───┬───┘         └───┬───┘
      │      VPN         │
      ├──────────────────┤
      │   ┌──────────┐   │
      └──►│ On-Prem  │◄──┘
          └──────────┘

  4 VPCs = 6 peering + 4 VPN = 10 connections
  Every new VPC adds n-1 more. Scales as n(n-1)/2.
  
  
    ┌───────┐
  │ VPC A │──┐
  └───────┘  │
  ┌───────┐  │   ┌───────────────────┐
  │ VPC B │──┼──►│  Transit Gateway  │
  └───────┘  │   │  (central hub)    │
  ┌───────┐  │   └───────────────────┘
  │ VPC C │──┤           │
  └───────┘  │           │ VPN
  ┌───────┐  │     ┌──────────┐
  │ VPC D │──┘     │ On-Prem  │
  └───────┘        └──────────┘

  4 VPCs = 4 attachments + 1 VPN = 5 connections
  Every new VPC is just 1 more attachment. Scales linearly.
```

### Cilium CNI/ClusterMesh

Cilium CNI is a plugin for Kubernetes that uses eBPF for Kubernetes pod to pod networking, security, and observability. One of its features is **ClusterMesh**, which lets pods in different Kubernetes clusters talk to each other directly.

## Symptoms of the problem
The problem occurs when enabling cluster mesh in clusters that are connected via Transit Gateway.

- **Small requests work perfectly.** API calls with small payloads, health checks, DNS lookups.
- **Large requests silently fail.** HTTP responses over ~8.4KB between clusters hang. No error, no timeout (at least not quickly), no log entry.
- **TCP connections stall indefinitely.** The sending pod keeps retransmitting the same packet. The receiving pod never gets it. Eventually something upstream times out, but the root cause is invisible at the application layer.
- **Everything works within a single cluster.**

## Relevant Concepts

### **PMTUD**

Normally Path MTU discovery is responsible for systems agreeing on the current MTU size.

1. The sender sets the **"Don't Fragment" (DF)** bit on its TCP packets, which tells routers to return a message if the packet is too large.
2. A router in the middle of the network path receives a packet that's too large for the next hop.
3. The router **drops the packet** and sends back an **ICMP "Fragmentation Needed"** message, which includes the MTU of the constrained link. ICMP is a layer 3 protocol meant to be used for system messages.
4. The sender receives the ICMP message, reduces its packet size, and retransmits.
5. Traffic flows normally from then on.

### Encapsulation

To make traffic work across VPC boundaries, Cilium wraps pod traffic in a tunnel, typically **VXLAN** or **Geneve**. The original packet gets an outer IP header, a UDP header, and a VXLAN header added to it (around 50 bytes). A 9,001-byte packet from a pod becomes a 9,051-byte packet on the wire.

To handle this encapsulation overhead, cilium checks the MTU of the machine it is running on (in this case 9001), and adjusts the effective MTU down to account for the overhead. 

```jsx
Original pod packet:
┌──────────────────────────────────────────────────┐
│  Inner IP Header  │  TCP Header  │    Payload    │
│     (20 bytes)    │  (20 bytes)  │  (up to 8,411)│
└──────────────────────────────────────────────────┘
                Total: up to 8,451 bytes

After VXLAN encapsulation by Cilium:
┌──────────┬─────────┬──────────┬──────────┬──────────────────────────────┐
│ Outer    │ Outer   │ Outer    │  VXLAN   │     Original Pod Packet      │
│ Ethernet │ IP Hdr  │ UDP Hdr  │  Header  │  (inner IP + TCP + payload)  │
│ 14 bytes │ 20 bytes│ 8 bytes  │ 8 bytes  │       up to 8,451 bytes      │
└──────────┴─────────┴──────────┴──────────┴──────────────────────────────┘
│◄──────── 50 bytes overhead ────────────►│◄──── original packet ────────►│
                    Total: up to ~8,501 bytes
```

## Root cause

### What happens without encapsulation

In a normal network with TGW, PMTUD works exactly as designed:

```markdown
Node A ──── 9,001-byte packet ────► Transit Gateway (8,500 MTU)
                                        │
                                   Drops packet
                                        │
Node A ◄── ICMP "Frag Needed" ──────────┘
   │
   └── Reduces packet size to 8,500, retransmits.
```

### What happens with Cilium encapsulation

Now add VXLAN tunneling into the mix:

```markdown
Pod A ── 8,951-byte packet ──► Cilium Node A
                                    │
                              Encapsulates to ~9,001 bytes
                                    │
                               Transit Gateway (8,500 MTU)
                                    │
                              Drops the packet
                                    │
Cilium Node A ◄── ICMP "Frag Needed" ──┘
      │
      └── ??? (Pod A never finds out)
```

The Transit Gateway does the same thing, drops the oversized packet and sends ICMP back to the source. But the source IP on the outer packet is **Cilium Node A's IP**, not Pod A's IP. So the ICMP message lands on the node, not the pod.

Now Cilium needs to:

1. Receive the ICMP message on the node
2. Look inside the embedded original packet header (ICMP includes the first 28 bytes of the dropped packet)
3. Realize it's a VXLAN-encapsulated packet
4. Dig into the VXLAN payload to figure out which pod originally sent it
5. Forward an appropriate ICMP message to that pod

2-5 is not actually fully implemented ([GH issue 34380](https://github.com/cilium/cilium/issues/34380)), so the ICMP packet never actually gets to the pod.

Additionally, ingress policies (a feature of cilium that controls which pods are allowed to communicate with other pods) often block all ICMP communication by default ([GH Issue 26193](https://github.com/cilium/cilium/issues/26193)).

This issue does not happen if using VPC Peering because every point on the network uses the same MTU (9001), so the 8951 + 50 encapsulation packets all go through correctly without having to go through PMTUD at all.

## Workaround

A simple workaround to this solution is to clamp MTU on the k8s nodes to below the MTU for TGW (including the encapsulation overhead).

Another option is to set the TCP (layer 4) level configuration (MSS) that controls TCP segment size with a similar effect.