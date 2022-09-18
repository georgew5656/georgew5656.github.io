import { Link } from "react-router-dom";
import './Blog.css';

interface BlogRowProps {
    date: string
    path: string
    title: string
}


function BlogRow(props: BlogRowProps) {
    return <>
        <span className="row">{props.date}</span><span className="row"><Link to={"/" + props.path}>{props.title}</Link></span>
    </>;
  }

export function Blog() {
    return <div className="row">
        {BlogRow({date: "September 17, 2022", path: "portugal", title: "Portugal Notes"})}
    </div>
}
