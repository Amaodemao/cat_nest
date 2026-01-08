// src/pages/Journal.tsx
import { posts, type Post } from "../data/posts";
import { useNavigate } from "react-router-dom";
// import React from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";


function JournalCard({ card }: { card: Post }) {
  const navigate = useNavigate();

  return (
    <article 
      className="post" 
      key={card.slug} 
      onClick={() => navigate(`/journal/contents/${card.slug}`)}
      onKeyDown={(e) => {(e.key === "Enter" || e.key === " ") && navigate(`/journal/contents/${card.slug}`)}}
    >
      <h3>{card.title}</h3>
      <time dateTime={card.dateISO}>{card.dateText}</time>
      <p>{card.excerpt}</p>
    </article>
  );
}

export default function Journal() {
  function displayJournalCards() {
    if (posts.length === 0) {
      return (
        <p>No posts yet.</p>
      );
    } else {
      const cards = posts.map((p: Post) => (
        <JournalCard card={p} />
      ));
      return cards;
    };
  };

  return (
    <section id="journal" className="container" aria-labelledby="journal-title">
      <h2 id="journal-title">Journal</h2>
      <div className="post-list">{displayJournalCards()}</div>
    </section>
  );
}
