export function normalizeAttributes(
  attributes: Array<{ name: string; value?: string }>,
): Record<string, string | null> {
  const result: Record<string, string | null> = {};

  attributes.forEach(
    (attr) => (result[attr.name] = attr.value ? attr.value : null),
  );

  return result;
}

export type NormalizeAttributesType = ReturnType<typeof normalizeAttributes>;
