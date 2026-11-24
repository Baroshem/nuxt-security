/** Only changed runtime fields override configured hooks. / 只有變動的 runtime 欄位覆寫 hooks 設定。 */
export function runtimeSecurityOverrides(base: Record<string, unknown>, current: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(current).filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(base[key])))
}
