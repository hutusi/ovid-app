import { convertFileSrc } from "@tauri-apps/api/core";

function resolveRelativePath(baseDir: string, relative: string): string {
  const parts = baseDir.split("/");
  for (const seg of relative.split("/")) {
    if (seg === "..") parts.pop();
    else if (seg !== ".") parts.push(seg);
  }
  return parts.join("/");
}

/**
 * Resolve an image `src` attribute to a URL usable in Tauri's WebView.
 *
 * - External / data / blob / asset URLs pass through unchanged.
 * - Root-relative paths (/images/foo.png): prepend CDN base if configured,
 *   otherwise resolve against `assetRoot` (workspace's public/ dir or root).
 * - Relative paths (../assets/foo.png): resolve against `filePath`'s directory.
 */
export function resolveImageSrc(
  src: string,
  filePath: string | undefined,
  assetRoot: string | undefined,
  cdnBase: string | undefined
): string {
  if (!src) return src;
  if (/^(https?|data|blob|asset):/.test(src)) return src;

  if (src.startsWith("/")) {
    if (cdnBase) return `${cdnBase.replace(/\/$/, "")}${src}`;
    if (assetRoot) return convertFileSrc(`${assetRoot}${src}`);
    return src;
  }

  if (filePath) {
    const dir = filePath.substring(0, filePath.lastIndexOf("/"));
    return convertFileSrc(resolveRelativePath(dir, src));
  }

  return src;
}
