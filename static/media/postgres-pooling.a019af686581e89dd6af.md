This blog post covers a key part of scaling postgres to many clients, request pooling. 

**Process management in posters**

Postgres uses a single process per open connection. This is different from the connection pooling model more commonly seen in modern web servers like Jetty or OLAP databases like Druid (which is what I’m most familiar with), where a single pool of threads performs work on any open connection.

The main reason for this difference in process management (at least between databases) is the different query profile for Postgres vs OLAP databases like Druid.

**Transaction Management**

As a simplification, Druid and many other OLAP databases are append only databases. Insofar as they sometimes support updates, there isn't really a concept of a transaction because most analytics workloads don't need updates to a single row to be available immediately, nor do they need to wait for a update to be available before querying again.  

In contrast, Postgres does need to support transactions. Postgres has to keep a lot of information in memory (e.g. information about what versions of a row should be available to a client) for each connection to enforce transactions. In a shared thread pool model, Postgres would need to somehow save/restore all this transaction information every time each thread handled a new request.

**Caching** 

Postgres maintains per connection caches like lock state and prepared statements. These caches would need to be reloaded every time a shared thread pool handled a new request. In contrast, all of druid's caches are cluster-wide, so a worker thread picking up a new request doesn’t need to load extra per connection data into memory.

**Conclusion** 

Because of this process per connection requirement, Postgres can sometimes have trouble scaling to a high number of clients due to the memory overhead and context switching costs of creating a process for each client connection.

The most common solution to this problem is to use a proxy like PGbouncer. The most common configuration for PGBouncer is to have non-transactional queries be multiplexed (sent on any of the proxy's open connections to Postgres) while restricting transactions to a single connection. This supports much higher scale (pgbouncer has a fixed set of connections with Postgres, so no process inflation), while still supporting transactions for clients that need it.