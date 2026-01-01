import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import './Post.css';


export function Post() {
    const params = useParams();
    const [post, setPost] = useState("");

    useEffect(() => {
        if (!params.name) {
            setPost("");
            return;
        }

        const raw = require(`./posts/${params.name}.md`);
        fetch(raw)
            .then(r => r.text())
            .then(text => {
                setPost(text);
            });
    }, [params.name]);

    return <ReactMarkdown className="blog">{post}</ReactMarkdown>;
}
