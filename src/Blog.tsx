import { Component } from "react";
import { Link } from "react-router-dom";

interface BlogRowProps {
    date: string
    path: string
}


function BlogRow(props: BlogRowProps) {
    return <><span>{props.date}</span><span><Link to={"/" + props.path}>{props.path}</Link></span></>;
  }

export function Blog() {
    return <div>
        {BlogRow({date: "September 17, 2022", path: "portugal"})}
    </div>
}

export class Post extends Component {
    constructor(props: any) {
        super(props);
      }

    render() {
        return <div>portugal</div>
    }
}