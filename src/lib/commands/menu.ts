import { invokeCmd } from "./internal";

export interface SetMenuLanguageArgs {
  labels: Record<string, string>;
}

export const menu = {
  setLanguage: (args: SetMenuLanguageArgs) => invokeCmd<void>("set_menu_language", args),
};
