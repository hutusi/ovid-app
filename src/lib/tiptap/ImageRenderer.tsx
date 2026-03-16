import Image from "@tiptap/extension-image";
import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { resolveImageSrc } from "../imageUtils";

export { resolveImageSrc };

export interface ImageRendererOptions {
  filePath?: string;
  assetRoot?: string;
  cdnBase?: string;
  inline?: boolean;
  allowBase64?: boolean;
  HTMLAttributes?: Record<string, unknown>;
}

function ImageNodeView({ node, extension }: NodeViewProps) {
  const { filePath, assetRoot, cdnBase } = extension.options as ImageRendererOptions;
  const { src, alt, title } = node.attrs as { src: string; alt?: string; title?: string };
  const resolvedSrc = resolveImageSrc(src, filePath, assetRoot, cdnBase);

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
      assetRoot: undefined,
      cdnBase: undefined,
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});
