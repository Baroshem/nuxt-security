import { fileURLToPath } from 'node:url';
import { normalize, resolve } from 'pathe';
import { defineNuxtModule, addServerHandler, installModule } from '@nuxt/kit';
import defu, { createDefu } from 'defu';

const defaultThrowErrorValue = { throwError: true };
const SECURITY_MIDDLEWARE_NAMES = {
  requestSizeLimiter: "requestSizeLimiter",
  rateLimiter: "rateLimiter",
  xssValidator: "xssValidator",
  allowedMethodsRestricter: "allowedMethodsRestricter",
  basicAuth: "basicAuth",
  csrf: "csrf"
};
const defaultSecurityConfig = (serverlUrl) => ({
  headers: {
    crossOriginResourcePolicy: "same-origin",
    crossOriginOpenerPolicy: "same-origin",
    crossOriginEmbedderPolicy: "require-corp",
    contentSecurityPolicy: {
      "base-uri": ["'self'"],
      "font-src": ["'self'", "https:", "data:"],
      "form-action": ["'self'"],
      "frame-ancestors": ["'self'"],
      "img-src": ["'self'", "data:"],
      "object-src": ["'none'"],
      "script-src-attr": ["'none'"],
      "style-src": ["'self'", "https:", "'unsafe-inline'"],
      "upgrade-insecure-requests": true
    },
    originAgentCluster: "?1",
    referrerPolicy: "no-referrer",
    strictTransportSecurity: {
      maxAge: 15552e3,
      includeSubdomains: true
    },
    xContentTypeOptions: "nosniff",
    xDNSPrefetchControl: "off",
    xDownloadOptions: "noopen",
    xFrameOptions: "SAMEORIGIN",
    xPermittedCrossDomainPolicies: "none",
    xXSSProtection: "0",
    permissionsPolicy: {
      "camera": ["()"],
      "display-capture": ["()"],
      "fullscreen": ["()"],
      "geolocation": ["()"],
      "microphone": ["()"]
    }
  },
  requestSizeLimiter: {
    maxRequestSizeInBytes: 2e6,
    maxUploadFileRequestInBytes: 8e6,
    ...defaultThrowErrorValue
  },
  rateLimiter: {
    tokensPerInterval: 150,
    interval: "hour",
    fireImmediately: true,
    ...defaultThrowErrorValue
  },
  xssValidator: {
    ...defaultThrowErrorValue
  },
  allowedMethodsRestricter: "*",
  hidePoweredBy: true,
  basicAuth: false,
  enabled: true,
  csrf: false
});

const SECURITY_HEADER_NAMES = {
  contentSecurityPolicy: "Content-Security-Policy",
  crossOriginEmbedderPolicy: "Cross-Origin-Embedder-Policy",
  crossOriginOpenerPolicy: "Cross-Origin-Opener-Policy",
  crossOriginResourcePolicy: "Cross-Origin-Resource-Policy",
  originAgentCluster: "Origin-Agent-Cluster",
  referrerPolicy: "Referrer-Policy",
  strictTransportSecurity: "Strict-Transport-Security",
  xContentTypeOptions: "X-Content-Type-Options",
  xDNSPrefetchControl: "X-DNS-Prefetch-Control",
  xDownloadOptions: "X-Download-Options",
  xFrameOptions: "X-Frame-Options",
  xPermittedCrossDomainPolicies: "X-Permitted-Cross-Domain-Policies",
  xXSSProtection: "X-XSS-Protection",
  permissionsPolicy: "Permissions-Policy"
};
const headerValueMappers = {
  strictTransportSecurity: (value) => [
    `max-age=${value.maxAge}`,
    value.includeSubdomains && "includeSubDomains",
    value.preload && "preload"
  ].filter(Boolean).join("; "),
  contentSecurityPolicy: (value) => {
    return Object.entries(value).map(([directive, sources]) => {
      if (directive === "upgrade-insecure-requests") {
        return sources ? "upgrade-insecure-requests" : "";
      }
      return sources?.length && `${directive} ${sources.join(" ")}`;
    }).filter(Boolean).join("; ");
  },
  permissionsPolicy: (value) => Object.entries(value).map(([directive, sources]) => sources?.length && `${directive}=${sources.join(" ")}`).filter(Boolean).join(", ")
};
const getHeaderValueFromOptions = (headerType, headerOptions) => {
  if (typeof headerOptions.value === "string") {
    return headerOptions.value;
  }
  return headerValueMappers[headerType]?.(headerOptions) ?? headerOptions;
};

const module = defineNuxtModule({
  meta: {
    name: "nuxt-security-no-cors",
    configKey: "security"
  },
  async setup(options, nuxt) {
    const runtimeDir = fileURLToPath(new URL("./runtime", import.meta.url));
    nuxt.options.build.transpile.push(runtimeDir);
    nuxt.options.security = defuReplaceArray(
      { ...options, ...nuxt.options.security },
      {
        ...defaultSecurityConfig(nuxt.options.devServer.url)
      }
    );
    const securityOptions = nuxt.options.security;
    if (!securityOptions.enabled)
      return;
    registerSecurityNitroPlugins(nuxt, securityOptions);
    nuxt.options.runtimeConfig.private = defu(
      nuxt.options.runtimeConfig.private,
      {
        basicAuth: securityOptions.basicAuth
      }
    );
    delete securityOptions.basicAuth;
    nuxt.options.runtimeConfig.security = defu(
      nuxt.options.runtimeConfig.security,
      {
        ...securityOptions
      }
    );
    if (securityOptions.headers) {
      setSecurityResponseHeaders(nuxt, securityOptions.headers);
    }
    setSecurityRouteRules(nuxt, securityOptions);
    if (nuxt.options.security.requestSizeLimiter) {
      addServerHandler({
        handler: normalize(
          resolve(runtimeDir, "server/middleware/requestSizeLimiter")
        )
      });
    }
    if (nuxt.options.security.rateLimiter) {
      addServerHandler({
        handler: normalize(
          resolve(runtimeDir, "server/middleware/rateLimiter")
        )
      });
    }
    if (nuxt.options.security.xssValidator) {
      addServerHandler({
        handler: normalize(
          resolve(runtimeDir, "server/middleware/xssValidator")
        )
      });
    }
    const allowedMethodsRestricterConfig = nuxt.options.security.allowedMethodsRestricter;
    if (allowedMethodsRestricterConfig && !Object.values(allowedMethodsRestricterConfig).includes("*")) {
      addServerHandler({
        handler: normalize(
          resolve(runtimeDir, "server/middleware/allowedMethodsRestricter")
        )
      });
    }
    const basicAuthConfig = nuxt.options.runtimeConfig.private.basicAuth;
    if (basicAuthConfig && (basicAuthConfig?.enabled || basicAuthConfig?.value?.enabled)) {
      addServerHandler({
        route: basicAuthConfig.route || "",
        handler: normalize(resolve(runtimeDir, "server/middleware/basicAuth"))
      });
    }
    const csrfConfig = nuxt.options.security.csrf;
    if (csrfConfig) {
      if (Object.keys(csrfConfig).length) {
        await installModule("nuxt-csurf", csrfConfig);
      }
      await installModule("nuxt-csurf");
    }
  }
});
const defuReplaceArray = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) || Array.isArray(value)) {
    obj[key] = value;
    return true;
  }
});
const setSecurityResponseHeaders = (nuxt, headers) => {
  for (const header in headers) {
    if (headers[header]) {
      const nitroRouteRules = nuxt.options.nitro.routeRules;
      const headerOptions = headers[header];
      const headerRoute = headerOptions.route || "/**";
      nitroRouteRules[headerRoute] = {
        ...nitroRouteRules[headerRoute],
        headers: {
          ...nitroRouteRules[headerRoute]?.headers,
          [SECURITY_HEADER_NAMES[header]]: getHeaderValueFromOptions(header, headerOptions)
        }
      };
    }
  }
};
const setSecurityRouteRules = (nuxt, securityOptions) => {
  const nitroRouteRules = nuxt.options.nitro.routeRules;
  delete securityOptions.headers;
  for (const middleware in securityOptions) {
    if (securityOptions[middleware]) {
      const middlewareConfig = securityOptions[middleware];
      if (middlewareConfig.route === "" || middlewareConfig.route !== void 0) {
        middlewareConfig.route = "/**";
      }
      const middlewareValue = middlewareConfig.value && middlewareConfig.route ? { ...middlewareConfig.value } : { ...middlewareConfig };
      const middlewareRoute = middlewareConfig.route || "/**";
      nitroRouteRules[middlewareRoute] = {
        ...nitroRouteRules[middlewareRoute],
        security: {
          ...nitroRouteRules[middlewareRoute]?.security,
          [SECURITY_MIDDLEWARE_NAMES[middleware]]: {
            ...middlewareValue,
            throwError: middlewareConfig.throwError
          }
        }
      };
    }
  }
};
const registerSecurityNitroPlugins = (nuxt, securityOptions) => {
  nuxt.hook("nitro:config", (config) => {
    config.plugins = config.plugins || [];
    if (securityOptions.hidePoweredBy) {
      config.externals = config.externals || {};
      config.externals.inline = config.externals.inline || [];
      config.externals.inline.push(
        normalize(fileURLToPath(new URL("./runtime", import.meta.url)))
      );
      config.plugins.push(
        normalize(
          fileURLToPath(
            new URL("./runtime/nitro/plugins/hidePoweredBy", import.meta.url)
          )
        )
      );
    }
    if (typeof securityOptions.headers === "object" && securityOptions.headers.contentSecurityPolicy) {
      config.plugins.push(
        normalize(
          fileURLToPath(
            new URL("./runtime/nitro/plugins/cspSsg", import.meta.url)
          )
        )
      );
    }
  });
};

export { module as default };
