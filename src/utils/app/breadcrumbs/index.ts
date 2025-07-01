import { BreadcrumbMap } from "@/interfaces/breadcrumbs";

// Normalize trailing slash
const normalizePath = (path: string): string =>
  path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;

// Get breadcrumb labels from the map
export function getBreadcrumbLabels(
  pathname: string,
  map: BreadcrumbMap,
): string[] {
  const normalized = normalizePath(pathname);
  return map[normalized] ?? ["Home"];
}

// Get href for a breadcrumb index
export function getHrefByIndex(
  index: number,
  labels: string[],
  map: BreadcrumbMap,
): string {
  const match = Object.entries(map).find(
    ([, crumbTrail]) =>
      crumbTrail.length === index + 1 &&
      crumbTrail.slice(0, index + 1).every((c, i) => c === labels[i]),
  );

  return match?.[0] ?? "#";
}
