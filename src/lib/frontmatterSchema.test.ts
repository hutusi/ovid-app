import { describe, expect, test } from "bun:test";
import {
  coerceCustomFrontmatterValue,
  coerceFrontmatterInput,
  getFrontmatterFieldDefaultValue,
  getMissingAddableFrontmatterFields,
  isKnownFrontmatterField,
  parseBooleanFrontmatterValue,
} from "./frontmatterSchema";

describe("frontmatter schema", () => {
  test("parses boolean frontmatter values", () => {
    expect(parseBooleanFrontmatterValue(true)).toBe(true);
    expect(parseBooleanFrontmatterValue(false)).toBe(false);
    expect(parseBooleanFrontmatterValue("true")).toBe(true);
    expect(parseBooleanFrontmatterValue("FALSE")).toBe(false);
    expect(parseBooleanFrontmatterValue("yes")).toBeNull();
    expect(parseBooleanFrontmatterValue(null)).toBeNull();
  });

  test("coerces known boolean input to real booleans", () => {
    expect(coerceFrontmatterInput("featured", "false")).toBe(false);
    expect(coerceFrontmatterInput("pinned", "true")).toBe(true);
    expect(coerceFrontmatterInput("featured", "")).toBe(false);
  });

  test("coerces known tag input to arrays", () => {
    expect(coerceFrontmatterInput("tags", "notes, writing")).toEqual(["notes", "writing"]);
    expect(coerceFrontmatterInput("tags", "")).toEqual([]);
  });

  test("tracks hidden known fields", () => {
    expect(isKnownFrontmatterField("type")).toBe(true);
    expect(isKnownFrontmatterField("unknownField")).toBe(false);
  });

  test("returns defaults for addable known fields", () => {
    expect(getFrontmatterFieldDefaultValue("featured")).toBe(false);
    expect(getFrontmatterFieldDefaultValue("coverImage")).toBe("");
    expect(getFrontmatterFieldDefaultValue("unknownField")).toBeNull();
  });

  test("lists missing addable known fields", () => {
    expect(
      getMissingAddableFrontmatterFields({
        title: "Post",
        featured: false,
      })
    ).toEqual(["pinned", "coverImage"]);
  });

  test("coerces custom metadata values by type", () => {
    expect(coerceCustomFrontmatterValue("text", " hello ")).toBe("hello");
    expect(coerceCustomFrontmatterValue("boolean", "", true)).toBe(true);
    expect(coerceCustomFrontmatterValue("number", "42")).toBe(42);
    expect(coerceCustomFrontmatterValue("number", "abc")).toBeNull();
    expect(coerceCustomFrontmatterValue("date", "2026-04-24")).toBe("2026-04-24");
    expect(coerceCustomFrontmatterValue("tags", "one, two")).toEqual(["one", "two"]);
  });
});
