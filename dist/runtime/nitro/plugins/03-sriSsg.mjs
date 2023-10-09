import crypto from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { useNitro, tryUseNuxt } from "@nuxt/kit";
import { join, normalize, extname } from "pathe";
import { useRuntimeConfig } from "#imports";
export default (function(nitro) {
  if (!tryUseNuxt()) {
    return;
  }
  const publicAssets = useNitro().options.publicAssets;
  const hashAlgorithm = "sha384";
  const scriptHashTables = {};
  for (const publicAsset of publicAssets) {
    const { dir, baseURL = "" } = publicAsset;
    const files = readdirSync(dir);
    for (const file of files) {
      const fileContent = readFileSync(normalize(join(dir, file)));
      const hash = generateHash(fileContent, hashAlgorithm);
      const key = normalize(join(baseURL, file));
      scriptHashTables[key] = hash;
    }
  }
  nitro.hooks.hook("render:html", async (html, { event }) => {
    const moduleOptions = useRuntimeConfig().security;
    if (!isSriEnabled(event, moduleOptions)) {
      return;
    }
    const foundSriHashes = /* @__PURE__ */ new Set();
    for (const templatePart of ["head", "bodyPrepend", "bodyAppend"]) {
      const elements = html[templatePart];
      const modifiedElements = [];
      for (const element of elements) {
        const scriptPattern = /<script.*?src="(.*?)"(.*?)><\/script>/gsd;
        let match;
        let modifiedElement = "";
        let currentPos = 0;
        while ((match = scriptPattern.exec(element)) !== null) {
          const { 1: src, indices: [, , [, insertPos]] = [] } = match;
          if (src) {
            const hash = await getHashForSource(src);
            foundSriHashes.add(hash);
            const startStr = element.substring(currentPos, insertPos);
            modifiedElement += startStr + ` integrity="${hash}"`;
            currentPos = insertPos;
          }
        }
        modifiedElement += element.substring(currentPos);
        modifiedElements.push(modifiedElement);
      }
      html[templatePart] = modifiedElements;
    }
    const metaPattern = /<meta http-equiv="Content-Security-Policy" content="(.*?)">/gs;
    html.head = html.head.map((headLine) => {
      const match = metaPattern.exec(headLine);
      if (!match) {
        return headLine;
      } else {
        const content = match[1];
        const modifiedContent = addSriHashesToCSP(content, foundSriHashes);
        const newLine = headLine.replace(content, modifiedContent);
        return newLine;
      }
    });
  });
  async function getHashForSource(src) {
    if (src.startsWith("https://")) {
      const response = await fetch(new URL(src));
      const content = await response.arrayBuffer();
      const hash = generateHash(Buffer.from(content), hashAlgorithm);
      return hash;
    } else {
      return scriptHashTables[src];
    }
  }
  function addSriHashesToCSP(content, hashes) {
    const cspPolicies = content.split(";").map((policy) => policy.trim());
    const scriptSrcDirective = cspPolicies.find((policy) => policy.startsWith("script-src ")) ?? "";
    const scriptSrcSources = scriptSrcDirective.split(" ");
    scriptSrcSources[0] = "script-src";
    const newSources = Array.from(hashes).map((hash) => `'${hash}'`);
    scriptSrcSources.push(...newSources);
    const newSrcDirective = scriptSrcSources.join(" ");
    const newContent = content.replace(scriptSrcDirective, newSrcDirective);
    return newContent;
  }
  function generateHash(content, hashAlgorithm2) {
    const hash = crypto.createHash(hashAlgorithm2);
    hash.update(content);
    return `${hashAlgorithm2}-${hash.digest("base64")}`;
  }
  function isSriEnabled(event, options) {
    const nitroPrerenderHeader = "x-nitro-prerender";
    if (!event.node.req.headers[nitroPrerenderHeader]) {
      return false;
    }
    if (!["", ".html"].includes(extname(event.node.req.headers[nitroPrerenderHeader]))) {
      return false;
    }
    return true;
  }
});
