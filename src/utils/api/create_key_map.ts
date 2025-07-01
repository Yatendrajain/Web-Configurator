export const createKeyMap = <T extends Record<string, unknown>>(
  obj: T,
): { [K in keyof T]: K } => {
  const result = {} as { [K in keyof T]: K };
  for (const key in obj) {
    result[key] = key;
  }
  return result;
};
