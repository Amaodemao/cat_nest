import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ViewTransitionNavLink from "../components/ViewTransitionNavLink";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { parseFrontmatter } from "../utils/frontmatter";


// �?Vite 预先知道有哪�?.md，可以按需异步加载原始文本
const mdModules = import.meta.glob("/public/blogs/**/*.md", { as: "raw" });

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [md, setMd] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const key = useMemo(() => {
    if (!slug) return null;
    // 在已收集的文件里找到�?/{slug}.md 结尾的那�?
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
        const raw = await loader();
        if (mounted) {
          const parsed = parseFrontmatter(raw);
          setMd(parsed.content);
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
      <section className="container">
        <p>{err}</p>
        <ViewTransitionNavLink to="/journal" className="link-inline">�?Back to Journal</ViewTransitionNavLink>
      </section>
    );
  }

  if (!md) {
    return <section className="container"><p>Loading�?</p></section>;
  }

  return (
    <section className="container">
      <article className="markdown">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
        >
          {md}
        </ReactMarkdown>
      </article>
      <p className="mt-8"><ViewTransitionNavLink to="/journal" className="link-inline">�?Back to Journal</ViewTransitionNavLink></p>
    </section>
  );
}


