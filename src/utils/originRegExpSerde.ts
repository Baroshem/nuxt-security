import type { CorsOptions } from '../module';

const REG_SERIALIZE_KEY = '_nuxt_security_origin_serialized_regexp';

export const modifyRegExpToJSON = (reg: RegExp) => {
  (reg as any).toJSON = () => ({
    [REG_SERIALIZE_KEY]: reg.toString(),
  });
};

export const getDeserializedRegExp = (regObj: Record<string, string>) => {
  const regStr = regObj?.[REG_SERIALIZE_KEY];
  if (typeof regStr !== 'string') return null;
  const fragments = regStr.match(/\/(.*?)\/([a-z]*)?$/i);
  if (!fragments?.length) return null;
  return new RegExp(fragments?.[1], fragments?.[2] || '');
};

export const modifyCorsHandlerOriginRegExpToJSON = (corsHandler?: CorsOptions | false) => {
  if (typeof corsHandler === 'object' && Array.isArray(corsHandler.origin)) {
    corsHandler.origin.forEach((o) => {
      o instanceof RegExp && modifyRegExpToJSON(o);
    });
  }
};

export const getRegExpOriginRestoredCorsHandler = (corsHandler?: CorsOptions | false) => {
  let originOption = typeof corsHandler === 'object' ? corsHandler.origin : undefined;
  if (typeof corsHandler !== 'object') return corsHandler;
  if (Array.isArray(corsHandler.origin)) {
    originOption = corsHandler.origin.map((o) => {
      const origin = getDeserializedRegExp(o as any);
      return origin ?? o;
    });
  }
  const result: CorsOptions = {
    ...corsHandler,
    origin: originOption,
  };
  return result;
};
