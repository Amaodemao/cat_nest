import { useEffect, useMemo, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";


// 让 Vite 预先知道有哪些 .md，可以按需异步加载原始文本
const mdModules = import.meta.glob("/public/blogs/**/*.md", { as: "raw" });

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [md, setMd] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const key = useMemo(() => {
    if (!slug) return null;
    // 在已收集的文件里找到以 /{slug}.md 结尾的那个
    return Object.keys(mdModules).find(k => k.endsWith(`/${slug}.md`)) ?? null;
  }, [slug]);

  useEffect(() => {
    let mounted = true;
    if (!key) {
      setErr("Post not found.");
      setMd(null);
      return;
    }
    (async () => {
      try {
        const loader = mdModules[key] as () => Promise<string>;
        const content = await loader();
        if (mounted) {
          setMd(content);
          setErr(null);
        }
      } catch (e) {
        if (mounted) setErr("Failed to load post.");
      }
    })();
    return () => { mounted = false; };
  }, [key]);

  if (err) {
    return (
      <main className="container">
        <p>{err}</p>
        <NavLink to="/journal">← Back to Journal</NavLink>
      </main>
    );
  }

  if (!md) {
    return <main className="container"><p>Loading…</p></main>;
  }

  return (
    <main className="container">
      <article className="markdown">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
        >
          {md}
        </ReactMarkdown>
      </article>
      <p className="mt-8"><NavLink to="/journal">← Back to Journal</NavLink></p>
    </main>
  );
}
