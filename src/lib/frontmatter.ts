const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

export function parseFrontmatter(raw: string): {
  frontmatter: string;
  body: string;
} {
  const match = FRONTMATTER_RE.exec(raw);
  if (match) {
    return { frontmatter: match[0], body: raw.slice(match[0].length) };
  }
  return { frontmatter: "", body: raw };
}

export function joinFrontmatter(frontmatter: string, body: string): string {
  return frontmatter + body;
}
