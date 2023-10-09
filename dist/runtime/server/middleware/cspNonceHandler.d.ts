export type NonceOptions = {
    enabled: boolean;
    mode: 'renew' | 'check';
    value: undefined | (() => string);
};
declare const _default: import("h3").EventHandler<import("h3").EventHandlerRequest, void>;
export default _default;
