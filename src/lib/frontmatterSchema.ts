import type { FrontmatterValue, ParsedFrontmatter } from "./frontmatter";

export type FrontmatterFieldKind = "text" | "boolean" | "date" | "tags" | "path";

export interface FrontmatterFieldSchema {
  key: string;
  label: string;
  kind: FrontmatterFieldKind;
  hidden?: boolean;
  addable?: boolean;
  defaultValue?: FrontmatterValue;
}

export const FRONTMATTER_FIELD_SCHEMA: Record<string, FrontmatterFieldSchema> = {
  title: { key: "title", label: "Title", kind: "text" },
  type: { key: "type", label: "Type", kind: "text", hidden: true },
  draft: { key: "draft", label: "Draft", kind: "boolean" },
  featured: {
    key: "featured",
    label: "Featured",
    kind: "boolean",
    addable: true,
    defaultValue: false,
  },
  pinned: {
    key: "pinned",
    label: "Pinned",
    kind: "boolean",
    addable: true,
    defaultValue: false,
  },
  date: { key: "date", label: "Date", kind: "date" },
  tags: { key: "tags", label: "Tags", kind: "tags" },
  coverImage: {
    key: "coverImage",
    label: "Cover Image",
    kind: "path",
    addable: true,
    defaultValue: "",
  },
};

export function getFrontmatterFieldSchema(key: string): FrontmatterFieldSchema | undefined {
  return FRONTMATTER_FIELD_SCHEMA[key];
}

export function isKnownFrontmatterField(key: string): boolean {
  return getFrontmatterFieldSchema(key) !== undefined;
}

export function getFrontmatterFieldLabel(key: string): string {
  return getFrontmatterFieldSchema(key)?.label ?? key;
}

export function getMissingAddableFrontmatterFields(frontmatter: ParsedFrontmatter): string[] {
  return Object.values(FRONTMATTER_FIELD_SCHEMA)
    .filter((field) => field.addable && frontmatter[field.key] === undefined)
    .map((field) => field.key);
}

export function getFrontmatterFieldDefaultValue(key: string): FrontmatterValue | null {
  return getFrontmatterFieldSchema(key)?.defaultValue ?? null;
}

export function parseBooleanFrontmatterValue(value: FrontmatterValue): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return null;
}

export function readBooleanFrontmatterValue(value: FrontmatterValue): boolean {
  return parseBooleanFrontmatterValue(value) ?? false;
}

export function coerceFrontmatterInput(key: string, value: string): FrontmatterValue {
  const schema = getFrontmatterFieldSchema(key);
  const trimmed = value.trim();

  if (schema?.kind === "boolean") {
    return parseBooleanFrontmatterValue(trimmed) ?? false;
  }

  if (schema?.kind === "tags") {
    return trimmed
      ? trimmed
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];
  }

  return trimmed || null;
}
