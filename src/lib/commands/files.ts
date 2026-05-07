import { invokeCmd } from "./internal";

export interface ReadFileArgs {
  path: string;
}

export interface WriteFileArgs {
  path: string;
  content: string;
}

export interface CreateFileArgs {
  path: string;
  content: string;
}

export interface RenameFileArgs {
  oldPath: string;
  newPath: string;
}

export interface DuplicateEntryArgs {
  srcPath: string;
  destPath: string;
}

export interface TrashFileArgs {
  path: string;
}

export interface CreateDirArgs {
  path: string;
}

export interface EnsureDirArgs {
  path: string;
}

export const files = {
  read: (args: ReadFileArgs) => invokeCmd<string>("read_file", args),
  write: (args: WriteFileArgs) => invokeCmd<void>("write_file", args),
  create: (args: CreateFileArgs) => invokeCmd<void>("create_file", args),
  rename: (args: RenameFileArgs) => invokeCmd<void>("rename_file", args),
  duplicate: (args: DuplicateEntryArgs) => invokeCmd<void>("duplicate_entry", args),
  trash: (args: TrashFileArgs) => invokeCmd<void>("trash_file", args),
  createDir: (args: CreateDirArgs) => invokeCmd<void>("create_dir", args),
  ensureDir: (args: EnsureDirArgs) => invokeCmd<void>("ensure_dir", args),
};
