import { Link } from "react-router-dom";
import './Blog.css';
import posts from "./posts.json";

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
    return <>
        {posts.map(post => (
            <div className="row" key={post.path}>
                {BlogRow({date: post.date, path: post.path, title: post.title})}
            </div>
        ))}
    </>
}
