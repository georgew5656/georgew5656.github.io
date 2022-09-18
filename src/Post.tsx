import { Component } from "react";
import ReactMarkdown from "react-markdown";

import './Post.css';


export class Post extends Component<{name: string}, {post: string}> {
    constructor(props: any) {
        super(props);
        this.state = {post: "" }
      }
    componentDidMount() {
        const raw = require(`./posts/${this.props.name}.md`)
        fetch(raw)
        .then(r => r.text())
        .then(text => {
          this.setState({post: text})
        });
    }
    render() {
        return <ReactMarkdown className="blog">{this.state.post}</ReactMarkdown>
    }
}