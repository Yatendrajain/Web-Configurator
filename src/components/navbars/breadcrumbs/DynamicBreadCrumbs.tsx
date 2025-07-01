"use client";

import React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumbs, Link as MUILink, Typography, Box } from "@mui/material";
import Icon from "@/components/IconConfig";
import { getBreadcrumbLabels, getHrefByIndex } from "@/utils/app/breadcrumbs";
import { breadcrumbMap } from "@/app/lib/breadcrumbs/map";

const handleDynamicRoute = (pathname: string) => {
  const parentRoute = pathname.split("/").filter(Boolean);
  if (parentRoute[0] === "history") {
    if (pathname.includes("view")) {
      return "/history/details";
    } else if (pathname.includes("edit")) {
      return "/history/clone";
    } else {
      return pathname;
    }
  } else {
    return pathname;
  }
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
