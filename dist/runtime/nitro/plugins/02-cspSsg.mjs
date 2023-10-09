import path from "node:path";
import crypto from "node:crypto";
import { useRuntimeConfig } from "#imports";
import defu from "defu";
export default (function(nitro) {
  nitro.hooks.hook("render:html", (html, { event }) => {
    const moduleOptions = useRuntimeConfig().security;
    if (!isContentSecurityPolicyEnabled(event, moduleOptions)) {
      return;
    }
    const scriptPattern = /<script[^>]*>(.*?)<\/script>/gs;
    const scriptHashes = [];
    const hashAlgorithm = "sha256";
    let match;
    while ((match = scriptPattern.exec(html.bodyAppend.join(""))) !== null) {
      if (match[1]) {
        scriptHashes.push(generateHash(match[1], hashAlgorithm));
      }
    }
    const securityHeaders = moduleOptions.headers;
    const contentSecurityPolicies = securityHeaders.contentSecurityPolicy.value || securityHeaders.contentSecurityPolicy;
    html.head.push(generateCspMetaTag(contentSecurityPolicies, scriptHashes));
  });
  function generateCspMetaTag(policies, scriptHashes) {
    const unsupportedPolicies = {
      "frame-ancestors": true,
      "report-uri": true,
      sandbox: true
    };
    const tagPolicies = defu(policies);
    if (scriptHashes.length > 0) {
      tagPolicies["script-src"] = (tagPolicies["script-src"] ?? []).concat(scriptHashes);
    }
    const contentArray = [];
    for (const [key, value] of Object.entries(tagPolicies)) {
      if (unsupportedPolicies[key]) {
        continue;
      }
      let policyValue;
      if (Array.isArray(value)) {
        policyValue = value.join(" ");
      } else if (typeof value === "boolean") {
        policyValue = "";
      } else {
        policyValue = value;
      }
      contentArray.push(`${key} ${policyValue}`);
    }
    const content = contentArray.join("; ");
    return `<meta http-equiv="Content-Security-Policy" content="${content}">`;
  }
  function generateHash(content, hashAlgorithm) {
    const hash = crypto.createHash(hashAlgorithm);
    hash.update(content);
    return `'${hashAlgorithm}-${hash.digest("base64")}'`;
  }
  function isContentSecurityPolicyEnabled(event, options) {
    const nitroPrerenderHeader = "x-nitro-prerender";
    if (!event.node.req.headers[nitroPrerenderHeader]) {
      return false;
    }
    if (!["", ".html"].includes(path.extname(event.node.req.headers[nitroPrerenderHeader]))) {
      return false;
    }
    return true;
  }
});
