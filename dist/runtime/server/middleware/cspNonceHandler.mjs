import crypto from "node:crypto";
import { createError, defineEventHandler, getCookie, sendError, setCookie } from "h3";
import { getRouteRules } from "#imports";
export default defineEventHandler((event) => {
  let csp = `${event.node.res.getHeader("Content-Security-Policy")}`;
  const routeRules = getRouteRules(event);
  if (routeRules.security.nonce !== false) {
    const nonceConfig = routeRules.security.nonce;
    let nonce;
    switch (nonceConfig?.mode) {
      case "check": {
        nonce = event.context.nonce ?? getCookie(event, "nonce");
        if (!nonce) {
          return sendError(event, createError({ statusCode: 401, statusMessage: "Nonce is not set" }));
        }
        break;
      }
      case "renew":
      default: {
        nonce = nonceConfig?.value ? nonceConfig.value() : Buffer.from(crypto.randomUUID()).toString("base64");
        setCookie(event, "nonce", nonce, { sameSite: true, secure: true });
        event.context.nonce = nonce;
        break;
      }
    }
    csp = csp.replaceAll("{{nonce}}", nonce);
  } else {
    csp = csp.replaceAll("'nonce-{{nonce}}'", "");
  }
  event.node.res.setHeader("Content-Security-Policy", csp);
});
