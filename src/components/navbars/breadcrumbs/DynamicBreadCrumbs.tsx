"use client";

import React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumbs, Link as MUILink, Typography, Box } from "@mui/material";
import Icon from "@/components/IconConfig";
import { getBreadcrumbLabels, getHrefByIndex } from "@/utils/app/breadcrumbs";
import { breadcrumbMap } from "@/app/lib/breadcrumbs/map";

const handleDynamicRoute = (pathname: string): string => {
  const [parentRoute] = pathname.split("/").filter(Boolean);

  const routeMap: Record<string, (path: string) => string> = {
    history: (path) => {
      if (path.includes("view")) return "/history/details";
      if (path.includes("clone")) return "/history/clone";
      return path;
    },
    productOrder: (path) => {
      if (path.includes("edit")) return "/productOrder/edit";
      return path;
    },
  };

  return routeMap[parentRoute]?.(pathname) || pathname;
};

const DynamicBreadcrumbs: React.FC = () => {
  const pathname = usePathname();
  const dynamicPath = handleDynamicRoute(pathname);
  const breadcrumbLabels = getBreadcrumbLabels(dynamicPath, breadcrumbMap);

  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      separator={<Icon name="chevronRight" size={8} />}
    >
      {breadcrumbLabels.map((label, index) => {
        const isLast = index === breadcrumbLabels.length - 1;

        if (index === 0) {
          return (
            <MUILink
              key="home"
              component={NextLink}
              href="/"
              underline="hover"
              color="text.secondary"
              aria-label="Home"
            >
              <Box display="flex" alignItems="center">
                <Icon name="breadcrumb" size={18} />
              </Box>
            </MUILink>
          );
        }

        const href = getHrefByIndex(index, breadcrumbLabels, breadcrumbMap);

        return isLast ? (
          <Typography key={href} color="#00886F" fontWeight={500} fontSize={14}>
            {label}
          </Typography>
        ) : (
          <MUILink
            key={href}
            component={NextLink}
            href={href}
            fontSize={14}
            underline="hover"
            color="text.secondary"
          >
            {label}
          </MUILink>
        );
      })}
    </Breadcrumbs>
  );
};

export default DynamicBreadcrumbs;
