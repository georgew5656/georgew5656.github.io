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
    return <>
        <div className="row">{BlogRow({date: "September 17, 2022", path: "portugal", title: "Portugal Notes"})}</div>
        <div className="row">{BlogRow({date: "November 13, 2022", path: "mexico-city", title: "Mexico City Notes"})}</div>
        <div className="row">{BlogRow({date: "December 11, 2022", path: "las-vegas", title: "Las Vegas Notes"})}</div>
        <div className="row">{BlogRow({date: "January 2, 2023", path: "zombie-companies", title: "Zombie Companies"})}</div>
    </>
}
