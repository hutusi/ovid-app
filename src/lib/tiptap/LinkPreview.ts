import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

const SHOW_DELAY_MS = 400;
const pluginKey = new PluginKey("linkPreview");

export const LinkPreview = Extension.create({
  name: "linkPreview",

  addProseMirrorPlugins() {
    const tooltip = document.createElement("div");
    tooltip.className = "link-preview-tooltip";
    document.body.appendChild(tooltip);

    let timer: ReturnType<typeof setTimeout> | null = null;

    function show(anchor: HTMLElement, href: string) {
      tooltip.textContent = href;
      tooltip.style.display = "block";
      const rect = anchor.getBoundingClientRect();
      const left = Math.min(rect.left, window.innerWidth - 368);
      tooltip.style.left = `${Math.max(8, left)}px`;
      tooltip.style.top = `${rect.bottom + 6}px`;
    }

    function hide() {
      tooltip.style.display = "none";
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    }

    return [
      new Plugin({
        key: pluginKey,
        props: {
          handleDOMEvents: {
            mouseover(_view, event) {
              const target = event.target as HTMLElement;
              const anchor = target.closest("a");
              if (!anchor) return false;
              const href = anchor.getAttribute("href");
              if (!href) return false;
              if (timer !== null) clearTimeout(timer);
              timer = setTimeout(() => show(anchor, href), SHOW_DELAY_MS);
              return false;
            },
            mouseout(_view, event) {
              const related = event.relatedTarget as HTMLElement | null;
              if (related?.closest("a")) return false;
              hide();
              return false;
            },
          },
        },
        view() {
          return {
            destroy() {
              hide();
              tooltip.remove();
            },
          };
        },
      }),
    ];
  },
});
