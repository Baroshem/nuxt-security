// Matches either an HTML comment or an opening tag. Quoted attribute values are consumed
// as a whole, so a `>` inside a value never ends the tag early.
// Only text that really starts a tag is looked at: quote characters in text or in the
// content of <style> and <script> elements are never paired up with anything.
const TAG_RE = /<!--[\s\S]*?(?:-->|$)|<([a-z][^\s/>]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/gi
const ATTRIBUTE_RE = /(\s+)([^\s=/>]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/g
const NONCE_TAGS = new Set(['link', 'script', 'style'])
// The content of these elements is raw text, it can not contain tags.
const RAW_TEXT_TAGS = new Set(['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes'])

/**
 * Adds a `nonce` attribute to every `<link>`, `<script>` and `<style>` tag found in an HTML string.
 * An existing `nonce` attribute on those tags is replaced.
 * Tags inside attribute values, comments and raw text elements are left alone.
 */
export function injectNonceToTags(html: string, nonce: string) {
  // Skip non-string elements
  if (typeof html !== 'string') {
    return html
  }

  const lowerCaseHtml = html.toLowerCase()
  const tagRe = new RegExp(TAG_RE)
  let result = ''
  let cursor = 0
  let match: RegExpExecArray | null

  while ((match = tagRe.exec(html)) !== null) {
    const [tag, name, attributes] = match
    const lowerCaseName = name?.toLowerCase()
    if (!lowerCaseName) {
      continue
    }

    if (NONCE_TAGS.has(lowerCaseName)) {
      let replaced = false
      const newAttributes = attributes.replace(ATTRIBUTE_RE, (attribute, whitespace, name) => {
        if (name.toLowerCase() !== 'nonce') return attribute
        if (replaced) return ''
        replaced = true
        return `${whitespace}nonce="${nonce}"`
      })
      result += html.slice(cursor, match.index) + `<${name}${replaced ? newAttributes : ` nonce="${nonce}"${newAttributes}`}>`
      cursor = match.index + tag.length
    }

    if (RAW_TEXT_TAGS.has(lowerCaseName)) {
      // Continue after the closing tag, whatever the raw text contains
      const closingTag = new RegExp(`</${lowerCaseName}(?=[\\s/>])`, 'gi')
      closingTag.lastIndex = match.index + tag.length
      const closing = closingTag.exec(lowerCaseHtml)
      tagRe.lastIndex = closing ? closing.index : html.length
    }
  }

  return result + html.slice(cursor)
}
