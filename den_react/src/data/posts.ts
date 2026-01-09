import { parseFrontmatter, type FrontmatterData } from "../utils/frontmatter";

export type Post = {
  title: string;
  dateISO: string;
  dateText: string;
  excerpt: string;
  tags: string[];
  slug: string;
};

const mdModules = import.meta.glob("/public/blogs/**/*.md", {
  as: "raw",
  eager: true,
});

function formatDateText(dateISO: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO);
  if (!match) return dateISO || "Unknown date";
  const [, year, month, day] = match;
  return `${month}/${day}/${year}`;
}

function normalizeDate(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
    return trimmed;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return "";
}

function toSlug(path: string) {
  const filename = path.split("/").pop() ?? "post";
  return filename.replace(/\.md$/i, "");
}

function normalizeTags(tags?: string[] | string) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(t => String(t).trim()).filter(Boolean);
  return String(tags)
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);
}

export const posts: Post[] = Object.entries(mdModules)
  .map(([path, raw]) => {
    const { data } = parseFrontmatter(raw as string);
    const meta = data as FrontmatterData;
    if (meta.published === false) return null;

    const dateISO = normalizeDate(meta.date);
    const title = typeof meta.title === "string" && meta.title.trim() ? meta.title.trim() : toSlug(path);
    const excerpt = typeof meta.introduction === "string" ? meta.introduction.trim() : "";

    return {
      title,
      dateISO,
      dateText: formatDateText(dateISO),
      excerpt,
      tags: normalizeTags(meta.tags),
      slug: toSlug(path),
    };
  })
  .filter((post): post is Post => post !== null)
  .sort((a, b) => b.dateISO.localeCompare(a.dateISO));
