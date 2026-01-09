import { posts, type Post } from "../data/posts";
import { useViewTransitionNavigate } from "../hooks/useViewTransitionNavigate";

function JournalCard({ card }: { card: Post }) {
  const navigate = useViewTransitionNavigate();

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
      {card.tags.length > 0 && (
        <div className="post-tags">
          {card.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}
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
        <JournalCard key={p.slug} card={p} />
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
