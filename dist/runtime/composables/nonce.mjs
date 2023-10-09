import { useNuxtApp, useCookie } from "#imports";
export function useNonce() {
  return useNuxtApp().ssrContext?.event?.context.nonce ?? useCookie("nonce").value;
}
