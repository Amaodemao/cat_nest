export type Post = {
  title: string;
  dateISO: string;   // 形如 "2025-01-01"
  dateText: string;  // 用于显示的日期文本
  excerpt: string;   // 摘要
  slug: string;     // 可选：用于生成链接
};

export const posts: Post[] = [
  {
    title: "First Post Title",
    dateISO: "2025-01-01",
    dateText: "Jan 01, 2025",
    excerpt:
      "Write a short snippet of the post here. Link to the full post page if you want, or keep everything here on the homepage!",
    slug: "markdown-test",
  },
  {
    title: "Second Post Title",
    dateISO: "2025-01-02",
    dateText: "Jan 02, 2025",
    excerpt:
      "Write a short snippet of the post here. Link to the full post page if you want, or keep everything here on the homepage!",
    slug: "second-post-title",
  },
];