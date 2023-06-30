import { fileURLToPath } from "node:url";
import { resolve, normalize } from "pathe";
import { defineNuxtModule, addServerHandler, installModule } from "@nuxt/kit";
import defu, { createDefu } from "defu";
import { Nuxt, RuntimeConfig } from "@nuxt/schema";
import {
  AllowedHTTPMethods,
  BasicAuth,
  MiddlewareConfiguration,
  ModuleOptions,
  NuxtSecurityRouteRules,
  SecurityHeaders,
} from "./types";
import {
  defaultSecurityConfig,
  SECURITY_MIDDLEWARE_NAMES,
} from "./defaultConfig";
import { SECURITY_HEADER_NAMES, getHeaderValueFromOptions } from "./headers";

declare module "@nuxt/schema" {
  interface NuxtOptions {
    security: ModuleOptions;
  }
}

declare module "nitropack" {
  interface NitroRouteRules {
    security: NuxtSecurityRouteRules;
  }
  interface NitroRouteConfig {
    security: NuxtSecurityRouteRules;
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-security",
    configKey: "security",
  },
  async setup(options, nuxt) {
    const runtimeDir = fileURLToPath(new URL("./runtime", import.meta.url));
    nuxt.options.build.transpile.push(runtimeDir);
    nuxt.options.security = defuReplaceArray(
      { ...options, ...nuxt.options.security },
      {
        ...defaultSecurityConfig(nuxt.options.devServer.url),
      },
    );
    const securityOptions = nuxt.options.security;
    // Disabled module when `enabled` is set to `false`
    if (!securityOptions.enabled) return;

    registerSecurityNitroPlugins(nuxt, securityOptions);

    nuxt.options.runtimeConfig.private = defu(
      nuxt.options.runtimeConfig.private,
      {
        basicAuth: securityOptions.basicAuth as
          | MiddlewareConfiguration<BasicAuth>
          | BasicAuth
          | boolean,
      }
    );

    delete (securityOptions as any).basicAuth;

    nuxt.options.runtimeConfig.security = defu(
      nuxt.options.runtimeConfig.security,
      {
        ...(securityOptions as unknown as RuntimeConfig["security"]),
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
        ),
      });
    }

    if (nuxt.options.security.rateLimiter) {
      addServerHandler({
        handler: normalize(
          resolve(runtimeDir, "server/middleware/rateLimiter")
        ),
      });
    }

    if (nuxt.options.security.xssValidator) {
      addServerHandler({
        handler: normalize(
          resolve(runtimeDir, "server/middleware/xssValidator")
        ),
      });
    }

    if (nuxt.options.security.corsHandler) {
      addServerHandler({
        handler: normalize(
          resolve(runtimeDir, "server/middleware/corsHandler")
        ),
      });
    }

    const allowedMethodsRestricterConfig = nuxt.options.security
      .allowedMethodsRestricter;
    if (
      allowedMethodsRestricterConfig &&
      !Object.values(allowedMethodsRestricterConfig).includes("*")
    ) {
      addServerHandler({
        handler: normalize(
          resolve(runtimeDir, "server/middleware/allowedMethodsRestricter")
        ),
      });
    }

    // Register basicAuth middleware that is disabled by default
    const basicAuthConfig = nuxt.options.runtimeConfig.private
      .basicAuth;
    if (basicAuthConfig && ((basicAuthConfig as any)?.enabled || (basicAuthConfig as any)?.value?.enabled)) {
      addServerHandler({
        route: (basicAuthConfig as any).route || '',
        handler: normalize(resolve(runtimeDir, "server/middleware/basicAuth")),
      });
    }

    const csrfConfig = nuxt.options.security.csrf;
    if (csrfConfig) {
      if (Object.keys(csrfConfig).length) {
        await installModule("nuxt3-csurf", csrfConfig);
      }
      await installModule("nuxt3-csurf");
    }
  },
});

const defuReplaceArray = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) || Array.isArray(value)) {
    obj[key] = value;
    return true;
  }
});

const setSecurityResponseHeaders = (nuxt: Nuxt, headers: SecurityHeaders) => {
  for (const header in headers as SecurityHeaders) {
    if (headers[header as keyof typeof headers]) {
      const nitroRouteRules = nuxt.options.nitro.routeRules;
      const headerOptions = headers[header as keyof typeof headers];
      const headerRoute = (headerOptions as any).route || '/**'
      nitroRouteRules!![headerRoute] = {
        ...nitroRouteRules!![headerRoute],
        headers: {
          ...nitroRouteRules!![headerRoute]?.headers,
          [SECURITY_HEADER_NAMES[header]]: getHeaderValueFromOptions(header as keyof SecurityHeaders, headerOptions as any)
        },
      };
    }
  }
};

const setSecurityRouteRules = (nuxt: Nuxt, securityOptions: ModuleOptions) => {
  const nitroRouteRules = nuxt.options.nitro.routeRules;
  delete (securityOptions as any).headers;
  for (const middleware in securityOptions) {
    if (securityOptions[middleware as keyof typeof securityOptions]) {
      const middlewareConfig = securityOptions[
        middleware as keyof typeof securityOptions
      ] as MiddlewareConfiguration<any>;
      if (
        middlewareConfig.route === "" ||
        middlewareConfig.route !== undefined
      ) {
        middlewareConfig.route = "/**";
      }
      // TODO: remove with the next version
      // In previous approach middlewares were looking like {  value: { config }, route: '' }, while in the new they are just { config }
      const middlewareValue =
        middlewareConfig.value && middlewareConfig.route
          ? { ...middlewareConfig.value }
          : { ...middlewareConfig };
      const middlewareRoute = (middlewareConfig as any).route || '/**'
      nitroRouteRules!![middlewareRoute] = {
        ...nitroRouteRules!![middlewareRoute],
        security: {
          ...nitroRouteRules!![middlewareRoute]?.security,
          [SECURITY_MIDDLEWARE_NAMES[middleware]]: {
            ...middlewareValue,
            throwError: middlewareConfig.throwError,
          },
        },
      };
    }
  }
};

const registerSecurityNitroPlugins = (
  nuxt: Nuxt,
  securityOptions: ModuleOptions
) => {
  nuxt.hook("nitro:config", (config) => {
    config.plugins = config.plugins || [];

    // Register nitro plugin to replace default 'X-Powered-By' header with custom one that does not indicate what is the framework underneath the app.
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

    // Register nitro plugin to enable CSP for SSG
    if (
      typeof securityOptions.headers === "object" &&
      securityOptions.headers.contentSecurityPolicy
    ) {
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
