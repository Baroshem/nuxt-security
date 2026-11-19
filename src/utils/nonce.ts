// Matches either an HTML comment or an opening tag. Quoted attribute values are consumed
// as a whole, so a `>` inside a value never ends the tag early.
// Only text that really starts a tag is looked at: quote characters in text or in the
// content of <style> and <script> elements are never paired up with anything.
const TAG_RE = /<!--[\s\S]*?(?:-->|$)|<([a-z][^\s/>]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/gi
const NONCE_ATTR_RE = /(\s)nonce="[^"]*"/i
const NONCE_TAGS = new Set(['link', 'script', 'style'])
// The content of these elements is raw text, it can not contain tags.
const RAW_TEXT_TAGS = new Set(['script', 'style'])

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
    if (!lowerCaseName || !NONCE_TAGS.has(lowerCaseName)) {
      continue
    }

    const nonceAttribute = `nonce="${nonce}"`
    const newAttributes = NONCE_ATTR_RE.test(attributes)
      ? attributes.replace(NONCE_ATTR_RE, `$1${nonceAttribute}`)
      : ` ${nonceAttribute}${attributes}`
    result += html.slice(cursor, match.index) + `<${name}${newAttributes}>`
    cursor = match.index + tag.length

    if (RAW_TEXT_TAGS.has(lowerCaseName)) {
      // Continue after the closing tag, whatever the raw text contains
      const closing = lowerCaseHtml.indexOf(`</${lowerCaseName}`, cursor)
      tagRe.lastIndex = closing === -1 ? html.length : closing
    }
  }

  return result + html.slice(cursor)
}
