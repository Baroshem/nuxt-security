const tagNotPrecededByQuotes = (tag) => new RegExp(`(?<!['|"])<${tag}`, "g");
export default (function(nitro) {
  nitro.hooks.hook("render:html", (html, { event }) => {
    const nonce = parseNonce(`${event.node.res.getHeader("Content-Security-Policy")}`);
    if (!nonce) {
      return;
    }
    html.head = html.head.map((meta) => {
      if (!meta.startsWith('<meta http-equiv="Content-Security-Policy"')) {
        return meta;
      }
      return meta.replaceAll("{{nonce}}", nonce);
    });
    html.head = html.head.map((link) => link.replaceAll(tagNotPrecededByQuotes("link"), `<link nonce="${nonce}"`));
    html.bodyAppend = html.bodyAppend.map((link) => link.replaceAll(tagNotPrecededByQuotes("link"), `<link nonce="${nonce}"`));
    html.head = html.head.map((script) => script.replaceAll(tagNotPrecededByQuotes("script"), `<script nonce="${nonce}"`));
    html.bodyAppend = html.bodyAppend.map((script) => script.replaceAll(tagNotPrecededByQuotes("script"), `<script nonce="${nonce}"`));
    html.head = html.head.map((style) => style.replaceAll(tagNotPrecededByQuotes("style"), `<style nonce="${nonce}"`));
    html.bodyAppend = html.bodyAppend.map((style) => style.replaceAll(tagNotPrecededByQuotes("style"), `<style nonce="${nonce}"`));
  });
  function parseNonce(content) {
    const noncePattern = /nonce-([a-zA-Z0-9+/=]+)/;
    const match = content?.match(noncePattern);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  }
});
