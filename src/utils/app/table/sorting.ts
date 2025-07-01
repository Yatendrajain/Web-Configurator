export function sortBy<T>(
  data: T[] | undefined | null,
  key: keyof T,
  order: "asc" | "desc" = "asc",
): T[] {
  if (!Array.isArray(data)) return [];
  return data.slice().sort((a, b) => {
    const aVal = a[key] as string;
    const bVal = b[key] as string;
    return order === "asc"
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });
}
