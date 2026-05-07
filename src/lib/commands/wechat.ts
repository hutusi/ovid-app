import type { WechatCredStatus } from "./generated/WechatCredStatus";
import type { WechatPublishResult } from "./generated/WechatPublishResult";
import type { WechatUploadProgress } from "./generated/WechatUploadProgress";
import { invokeCmd, listenEvent } from "./internal";

export interface SetWechatCredentialsArgs {
  appId: string;
  appSecret: string;
}

export interface WechatPublishDraftArgs {
  title: string;
  author: string;
  digest: string | null;
  html: string;
  baseDir: string;
  assetRoot: string | null;
  coverImagePath: string | null;
  existingMediaId: string | null;
  contentSourceUrl: string | null;
  needOpenComment: boolean;
  canReward: boolean;
}

export const wechat = {
  credentialsStatus: () => invokeCmd<WechatCredStatus>("get_wechat_credentials_status"),
  setCredentials: (args: SetWechatCredentialsArgs) =>
    invokeCmd<void>("set_wechat_credentials", args),
  clearCredentials: () => invokeCmd<void>("clear_wechat_credentials"),
  publishDraft: (args: WechatPublishDraftArgs) =>
    invokeCmd<WechatPublishResult>("wechat_publish_draft", args),
  onUploadProgress: (handler: (progress: WechatUploadProgress) => void) =>
    listenEvent<WechatUploadProgress>("wechat-upload-progress", handler),
};
