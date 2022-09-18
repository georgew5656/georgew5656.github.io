import { Component } from "react";
import ReactMarkdown from "react-markdown";

import raw from "./posts/portugal.md"


export class Post extends Component<{}, {post: string}> {
    constructor(props: any) {
        super(props);
        this.state = {post: "" }
      }
    componentDidMount() {
        fetch(raw)
        .then(r => r.text())
        .then(text => {
          this.setState({post: text})
        });
    }
    render() {
        return <ReactMarkdown>{this.state.post}</ReactMarkdown>
    }
}