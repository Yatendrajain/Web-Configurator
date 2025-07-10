import { HistoryOrderField } from "@/interfaces/submissionhistory";

export function parseOrderHistoryFieldsFromConfig(
  dictionary: Record<string, string>,
  optionsMap: Record<string, string[]>,
  changedMappedSection: Record<string, string>,
  changedUnmappedSection: Record<string, string>,
): HistoryOrderField[] {
  const combinedChanges: {
    key: string;
    value: string;
    source: "mapped" | "unmapped";
  }[] = [
    ...Object.entries(changedMappedSection).map(([key, value]) => ({
      key,
      value,
      source: "mapped" as const,
    })),
    ...Object.entries(changedUnmappedSection).map(([key, value]) => ({
      key,
      value,
      source: "unmapped" as const,
    })),
  ];

  return combinedChanges.map(({ key: cfKey, value: coCode, source }) => {
    const label = dictionary[cfKey] || cfKey;
    const original = dictionary[coCode] || coCode || "--";

    const rawOptions = optionsMap[cfKey] || [];

    let options = rawOptions.map((opt) => ({
      value: opt,
      label: dictionary[opt] || opt,
    }));

    if (coCode && !rawOptions.includes(coCode)) {
      options = [
        { value: coCode, label: dictionary[coCode] || coCode },
        ...options,
      ];
    }

    return {
      key: cfKey,
      label,
      original,
      value: coCode,
      options,
      disabled: rawOptions.length === 0,
      source,
    };
  });
}
