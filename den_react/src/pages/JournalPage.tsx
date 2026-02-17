import { useMemo } from "react";
import { useParams } from "react-router-dom";
import "katex/dist/katex.min.css";
import ViewTransitionNavLink from "../components/ViewTransitionNavLink";
import { posts } from "../data/generatedPosts";

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();

  const post = useMemo(() => {
    if (!slug) return null;
    return posts.find((item) => item.slug === slug) ?? null;
  }, [slug]);

  if (!post) {
    return (
      <section className="container">
        <p>Post not found.</p>
        <ViewTransitionNavLink to="/journal" className="link-inline">
          Back to Journal
        </ViewTransitionNavLink>
      </section>
    );
  }

  return (
    <section className="container">
      <article className="markdown" dangerouslySetInnerHTML={{ __html: post.html }} />
      <p className="mt-8">
        <ViewTransitionNavLink to="/journal" className="link-inline">
          Back to Journal
        </ViewTransitionNavLink>
      </p>
    </section>
  );
}
