"use client";

import React, { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import BreadcrumbSkeleton from "@/components/navbars/breadcrumbs/BreadCrumbSkeleton";

const DynamicBreadcrumbs = dynamic(
  () => import("@/components/navbars/breadcrumbs/DynamicBreadCrumbs"),
  {
    ssr: false,
    loading: () => <BreadcrumbSkeleton />,
  },
);

interface SubNavProps {
  rightSection?: ReactNode;
}

const SubNav: React.FC<SubNavProps> = ({ rightSection }) => (
  <Box className="subnav-container" sx={{ top: "4rem !important" }}>
    {!rightSection ? (
      <Box p={0.8} px={0.5}>
        <DynamicBreadcrumbs />
      </Box>
    ) : (
      <>
        <DynamicBreadcrumbs />
        <Box className="subnav-right-section">{rightSection}</Box>
      </>
    )}
  </Box>
);

export default SubNav;
