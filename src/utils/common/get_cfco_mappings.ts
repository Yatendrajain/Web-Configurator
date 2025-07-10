export interface MappingItem {
  identifier: string;
  description: string;
  availableIdentifiers: [
    {
      identifier: string;
      description: string;
      [key: string]: unknown;
    },
  ];
  [key: string]: unknown;
}

export const getCFCOMappings = (
  mapping: Array<MappingItem>,
): [Record<string, string>, Record<string, Array<string>>] => {
  const dictionary: Record<string, string> = {};
  const optionsMap: Record<string, Array<string>> = {};

  mapping.forEach((mappingItem) => {
    dictionary[mappingItem.identifier] = mappingItem.description;

    const availableOptions: Array<string> = [];

    mappingItem.availableIdentifiers.forEach((optionItem) => {
      dictionary[optionItem.identifier] = optionItem.description;
      availableOptions.push(optionItem.identifier);
    });

    optionsMap[mappingItem.identifier] = availableOptions;
  });

  return [dictionary, optionsMap];
};
