import { invokeCmd } from "./internal";

export interface SaveAssetArgs {
  srcPath: string;
  activeFilePath?: string;
}

export interface SaveAssetFromBytesArgs {
  bytes: number[];
  extension: string;
  activeFilePath?: string;
}

export const assets = {
  save: (args: SaveAssetArgs) => invokeCmd<string>("save_asset", args),
  saveFromBytes: (args: SaveAssetFromBytesArgs) => invokeCmd<string>("save_asset_from_bytes", args),
  pickImage: () => invokeCmd<string | null>("pick_image_file"),
};
