import type { SearchResult } from "./generated/SearchResult";
import { invokeCmd } from "./internal";

export interface SearchWorkspaceArgs {
  query: string;
}

export const search = {
  workspace: (args: SearchWorkspaceArgs) => invokeCmd<SearchResult[]>("search_workspace", args),
};
