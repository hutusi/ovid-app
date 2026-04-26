import {
  type FrontmatterValue,
  joinFrontmatter,
  type ParsedFrontmatter,
  parseFrontmatter,
  parseYamlFrontmatter,
  serializeFrontmatter,
} from "./frontmatter";

function resetPostTemplateField(
  key: string,
  value: FrontmatterValue,
  today: string
): FrontmatterValue {
  switch (key.toLowerCase()) {
    case "title":
    case "slug":
    case "coverimage":
      return "";
    case "date":
      return today;
    case "draft":
      return true;
    case "featured":
    case "pinned":
      return false;
    case "tags":
      return [];
    default:
      return value;
  }
}

export function createPostFromExistingContent(raw: string, now: Date = new Date()): string {
  const { frontmatter } = parseFrontmatter(raw);
  if (!frontmatter) return "";

  const parsed = parseYamlFrontmatter(frontmatter);
  if (Object.keys(parsed).length === 0) {
    return frontmatter;
  }

  const today = now.toISOString().slice(0, 10);
  const next: ParsedFrontmatter = {};

  for (const [key, value] of Object.entries(parsed)) {
    next[key] = resetPostTemplateField(key, value, today);
  }

  return joinFrontmatter(serializeFrontmatter(next), "");
}
