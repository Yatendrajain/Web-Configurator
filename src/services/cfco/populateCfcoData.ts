import { CFData } from "@/interfaces/cfco";

const safe = (val: unknown) =>
  val === undefined || val === null || val === "" ? "--" : val;

function extractComment(obj: Record<string, unknown>): string {
  const commentKeys = ["comment1", "comment_1", "comment2", "comment_2"];
  for (const key of commentKeys) {
    const value = safe(obj[key]);
    if (value !== "--") {
      return String(value);
    }
  }
  return "--";
}

export function populateCfcoData(
  apiList: Array<Record<string, unknown>>,
): CFData[] {
  return apiList
    .filter(
      (item) =>
        item.type === "CF" ||
        (typeof item.identifier === "string" &&
          item.identifier.startsWith("XPL_CF")),
    )
    .map((cf: Record<string, unknown>) => {
      const children = Array.isArray(cf.availableIdentifiers)
        ? (cf.availableIdentifiers as Array<Record<string, unknown>>).map(
            (co: Record<string, unknown>) => ({
              id: String(safe(co.identifier)),
              type: "CO",
              description: String(safe(co.description)),
              parent: String(safe(cf.identifier)),
              comment: extractComment(co),
            }),
          )
        : [];

      return {
        id: String(safe(cf.identifier || cf.id)),
        type: String(safe(cf.type)) !== "--" ? String(safe(cf.type)) : "CF",
        description: String(safe(cf.description)),
        parent: String(safe(cf.parent)),
        comment: extractComment(cf),
        children: children ?? [],
      };
    });
}
