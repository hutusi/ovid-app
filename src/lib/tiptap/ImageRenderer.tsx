import { convertFileSrc } from "@tauri-apps/api/core";
import Image from "@tiptap/extension-image";
import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";

function resolveRelativePath(baseDir: string, relative: string): string {
  const parts = baseDir.split("/");
  for (const seg of relative.split("/")) {
    if (seg === "..") parts.pop();
    else if (seg !== ".") parts.push(seg);
  }
  return parts.join("/");
}

export function resolveImageSrc(
  src: string,
  filePath: string | undefined,
  workspaceRootPath: string | undefined,
  cdnBase: string | undefined
): string {
  if (!src) return src;
  // External URLs, data URIs, blob URLs, and already-resolved asset URLs pass through
  if (/^(https?|data|blob|asset):/.test(src)) return src;

  // Root-relative paths (e.g. /images/foo.png)
  if (src.startsWith("/")) {
    if (cdnBase) return `${cdnBase.replace(/\/$/, "")}${src}`;
    if (workspaceRootPath) return convertFileSrc(`${workspaceRootPath}${src}`);
    return src;
  }

  // Relative paths (e.g. ../assets/foo.png or ./images/bar.png)
  if (filePath) {
    const dir = filePath.substring(0, filePath.lastIndexOf("/"));
    return convertFileSrc(resolveRelativePath(dir, src));
  }

  return src;
}

export interface ImageRendererOptions {
  filePath?: string;
  workspaceRootPath?: string;
  cdnBase?: string;
  inline?: boolean;
  allowBase64?: boolean;
  HTMLAttributes?: Record<string, unknown>;
}

function ImageNodeView({ node, extension }: NodeViewProps) {
  const { filePath, workspaceRootPath, cdnBase } = extension.options as ImageRendererOptions;
  const { src, alt, title } = node.attrs as { src: string; alt?: string; title?: string };
  const resolvedSrc = resolveImageSrc(src, filePath, workspaceRootPath, cdnBase);

  return (
    <NodeViewWrapper as="span" contentEditable={false}>
      <img src={resolvedSrc} alt={alt ?? ""} {...(title ? { title } : {})} />
    </NodeViewWrapper>
  );
}

export const ImageRenderer = Image.extend<ImageRendererOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      filePath: undefined,
      workspaceRootPath: undefined,
      cdnBase: undefined,
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});
