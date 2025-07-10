import { FieldItem } from "@/interfaces/editProduct";
import {
  OptionsMap,
  ConfigurationString,
  Dictionary,
} from "@/interfaces/productType";

export function parseOrderFieldsFromConfig(
  dictionary: Dictionary,
  optionsMap: OptionsMap,
  configurationString: ConfigurationString,
): FieldItem[] {
  let config: Record<string, string> = {};
  try {
    config = JSON.parse(configurationString);
  } catch (e) {
    console.error("Invalid configuration string", e);
    return [];
  }

  return Object.entries(config).map(([cfKey, coCode]) => {
    const label = dictionary[cfKey] || cfKey;
    const hasValidCF = !!dictionary[cfKey];
    const hasValidCO = !!dictionary[coCode];
    const original = hasValidCO ? dictionary[coCode] : coCode;

    const rawOptions = optionsMap[cfKey] || [];

    let options = rawOptions.map((opt: string) => ({
      value: opt,
      label: dictionary[opt] || opt,
    }));

    if (coCode && !rawOptions.includes(coCode)) {
      options = [
        { value: coCode, label: dictionary[coCode] || coCode },
        ...options,
      ];
    }

    const source: "mapped" | "unmapped" =
      hasValidCF && hasValidCO ? "mapped" : "unmapped";

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
