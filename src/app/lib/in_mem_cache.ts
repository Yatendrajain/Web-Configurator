const store = new Map<string, string>();

export function setItemInCache(key: string, value: string): void {
  store.set(key, value);
}

export function getItemFromCache(key: string): string | undefined {
  return store.get(key);
}

export function deleteItemFromCache(key: string): boolean {
  return store.delete(key);
}
