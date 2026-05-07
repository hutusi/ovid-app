import { invokeCmd } from "./internal";

export const app = {
  restart: () => invokeCmd<void>("restart_app"),
};
