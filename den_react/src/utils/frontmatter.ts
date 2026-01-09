import { load } from "js-yaml";

export type FrontmatterData = {
  title?: string;
  introduction?: string;
  date?: string;
  tags?: string[] | string;
  published?: boolean;
};

const FRONTMATTER_RE = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/;

export function parseFrontmatter(raw: string): { data: FrontmatterData; content: string } {
  const match = FRONTMATTER_RE.exec(raw);
  if (!match) return { data: {}, content: raw };

  let data: FrontmatterData = {};
  try {
    const parsed = load(match[1]);
    if (parsed && typeof parsed === "object") {
      data = parsed as FrontmatterData;
    }
  } catch {
    data = {};
  }

  const content = raw.slice(match[0].length);
  return { data, content };
}
