import getCredentials from "basic-auth";
import { createError, defineEventHandler, sendError, setHeader } from "h3";
import { useRuntimeConfig } from "#imports";
const securityConfig = useRuntimeConfig().private;
export default defineEventHandler((event) => {
  const credentials = getCredentials(event.node.req);
  const basicAuthConfig = securityConfig.basicAuth;
  if (basicAuthConfig?.exclude?.some((el) => event.path?.startsWith(el))) {
    return;
  }
  if (!credentials || !validateCredentials(credentials, basicAuthConfig)) {
    setHeader(event, "WWW-Authenticate", `Basic realm=${basicAuthConfig.message || "Please enter username and password"}`);
    sendError(event, createError({ statusCode: 401, statusMessage: "Access denied" }));
  }
});
const validateCredentials = (credentials, config) => credentials?.name === config?.name && credentials?.pass === config?.pass;
