import DOMPurify from "dompurify"

const API_URL = import.meta.env.VITE_API_URL
const API_BASE = API_URL.endsWith("/") ? API_URL : API_URL + "/"

function resolveApiPath(path: string): string {
  return new URL(path.replace(/^\//, ""), API_BASE).href
}

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank")
    node.setAttribute("rel", "noopener noreferrer")
  }
})

const LINK_CARD_ATTRS = ["data-title", "data-icon", "data-domain"]

DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
  if (
    node.nodeName === "A" &&
    node.getAttribute("class")?.includes("link-card") &&
    LINK_CARD_ATTRS.includes(data.attrName)
  ) {
    data.keepAttr = true
  }
})

export function resolveUploadUrl(path: string): string {
  return resolveApiPath(path)
}

export function toRelativeAttachmentHtml(html: string): string {
  return html.replace(/https?:\/\/[^"'\s]+\/attachments\//g, "/attachments/")
}

export function sanitizeNoteHtml(html: string): string {
  const isPlainText = !/<[a-z][\s\S]*>/i.test(html)
  const source = isPlainText
    ? html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>")
    : html
  const clean = DOMPurify.sanitize(source, {
    RETURN_DOM: true,
  }) as unknown as HTMLElement
  clean.querySelectorAll('img[src^="/"]').forEach((img) => {
    const src = img.getAttribute("src")
    if (src) img.setAttribute("src", resolveApiPath(src))
  })
  return clean.innerHTML
}

export function noteHtmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}
