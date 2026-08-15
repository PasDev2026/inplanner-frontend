import { Node, mergeAttributes } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import type { Node as ProseMirrorNode } from "@tiptap/pm/model"
import { unfurlLink } from "@/features/notes/actions/note.api"

const SINGLE_URL_RE = /^https?:\/\/\S+$/i

export function isSingleUrl(text: string): boolean {
  return SINGLE_URL_RE.test(text.trim())
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function findNodePosition(
  doc: ProseMirrorNode,
  predicate: (node: ProseMirrorNode) => boolean,
): number | null {
  let found: number | null = null
  doc.descendants((node, pos) => {
    if (found === null && predicate(node)) {
      found = pos
      return false
    }
    return found === null
  })
  return found
}

export const LinkCard = Node.create({
  name: "linkCard",

  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      url: {
        default: null,
        parseHTML: (element) => element.getAttribute("href"),
        renderHTML: (attributes) => ({ href: attributes.url }),
      },
      title: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-title") ?? "",
        renderHTML: (attributes) => ({ "data-title": attributes.title ?? "" }),
      },
      icon: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-icon") ?? "",
        renderHTML: (attributes) => ({ "data-icon": attributes.icon ?? "" }),
      },
      domain: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-domain") ?? "",
        renderHTML: (attributes) => ({ "data-domain": attributes.domain ?? "" }),
      },
    }
  },

  parseHTML() {
    return [{ tag: "a.link-card", priority: 100 }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const { url, title, icon, domain } = node.attrs
    return [
      "a",
      mergeAttributes(HTMLAttributes, {
        class: "link-card",
        href: url,
        target: "_blank",
        rel: "noopener noreferrer",
      }),
      icon
        ? ["img", { src: icon, alt: "" }]
        : ["span", { class: "link-card-fallback" }],
      ["span", { class: "link-card-title" }, title || domain || url],
    ]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("linkCardPaste"),
        props: {
          handleClick: (view, pos, event) => {
            if (event.button !== 0) return false
            if (!view.editable) return false
            const anchor = (event.target as Element | null)?.closest?.("a.link-card") ?? null
            const href = anchor?.getAttribute("href")
            if (!href) return false
            window.open(href, "_blank")
            return true
          },
          handlePaste(view, event) {
            const text = event.clipboardData?.getData("text/plain")?.trim()
            if (!text || !isSingleUrl(text)) return false

            let parsed: URL
            try {
              parsed = new URL(text)
            } catch {
              return false
            }

            event.preventDefault()
            const domain = parsed.hostname
            const node = view.state.schema.nodes.linkCard?.create({
              url: parsed.href,
              title: domain,
              domain,
            })
            if (!node) return true

            view.dispatch(view.state.tr.replaceSelectionWith(node))
            view.focus()

            unfurlLink(parsed.href).then((data) => {
              if (!data || view.isDestroyed) return
              const pos = findNodePosition(
                view.state.doc,
                (n) => n.type.name === "linkCard" && n.attrs.url === parsed.href,
              )
              if (pos === null) return
              const existing = view.state.doc.nodeAt(pos)?.attrs ?? {}
              view.dispatch(
                view.state.tr.setNodeMarkup(pos, undefined, {
                  ...existing,
                  title: data.title,
                  icon: data.icon,
                }),
              )
            }).catch(() => {})
            return true
          },
        },
      }),
    ]
  },
})
