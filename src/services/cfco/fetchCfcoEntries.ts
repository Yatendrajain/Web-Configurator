export async function fetchCfcoEntries(productTypeId: string) {
  const API_URL = "/api/lookup_entries/list";
  const requestData = {
    filters: {
      productTypeId,
    },
    includeFields: {
      lookupVersions: ["versionName", "id"],
      availableIdentifiers: [
        "id",
        "identifier",
        "lookupVersionId",
        "description",
        "comment",
        "parent",
      ],
      lookupEntries: [
        "id",
        "identifier",
        "lookupVersionId",
        "description",
        "comment",
        "parent",
      ],
    },
    orderBy: "asc",
    sortBy: "identifier",
    pageLimit: 100,
    page: 1,
  };
  const encodedData = encodeURIComponent(JSON.stringify(requestData));
  const url = `${API_URL}?data=${encodedData}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch CF-CO data");
  const json = await res.json();
  return json.list || [];
}
