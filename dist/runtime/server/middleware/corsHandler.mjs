import { defineEventHandler, handleCors } from "h3";
import { getRouteRules } from "#imports";
export default defineEventHandler((event) => {
  const routeRules = getRouteRules(event);
  handleCors(event, routeRules.security.corsHandler);
});
