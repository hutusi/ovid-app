import type { ContentType } from "./generated/ContentType";
import { invokeCmd } from "./internal";

export const contentTypes = {
  get: () => invokeCmd<ContentType[]>("get_content_types"),
};
