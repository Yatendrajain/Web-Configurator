import { XMLParser } from "fast-xml-parser";
import fs from "fs/promises";

type FxpOptions = ConstructorParameters<typeof XMLParser>[0];

export function xmlStringToJson<T>(xmlString: string, options?: FxpOptions): T {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    ...options,
  });
  return parser.parse(xmlString) as T;
}

export async function xmlFileToJson<T>(
  filePath: string,
  options?: FxpOptions,
): Promise<T> {
  const xmlData = await fs.readFile(filePath, "utf-8");
  return xmlStringToJson<T>(xmlData, options);
}
