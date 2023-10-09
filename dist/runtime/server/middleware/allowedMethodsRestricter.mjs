import { defineEventHandler, createError } from "h3";
import { getRouteRules } from "#imports";
export default defineEventHandler((event) => {
  const routeRules = getRouteRules(event);
  const allowedMethods = routeRules.security.allowedMethodsRestricter;
  if (routeRules.security.allowedMethodsRestricter !== false) {
    if (!Object.values(allowedMethods).includes(event.node.req.method)) {
      const methodNotAllowedError = {
        statusCode: 405,
        statusMessage: "Method not allowed"
      };
      if (routeRules.security.allowedMethodsRestricter.throwError === false) {
        return methodNotAllowedError;
      }
      throw createError(methodNotAllowedError);
    }
  }
});
