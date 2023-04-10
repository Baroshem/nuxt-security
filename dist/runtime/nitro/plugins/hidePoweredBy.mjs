export default (function(nitro) {
  nitro.hooks.hook("render:response", (response) => {
    if (response.headers["x-powered-by"]) {
      delete response.headers["x-powered-by"];
    } else if (response.headers["X-Powered-By"]) {
      delete response.headers["X-Powered-By"];
    }
  });
});
