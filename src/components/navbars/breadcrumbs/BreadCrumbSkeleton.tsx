// components/BreadcrumbSkeleton.tsx
import React from "react";
import { Box, Skeleton } from "@mui/material";

const BreadcrumbSkeleton: React.FC = () => {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Skeleton variant="text" width={60} height={20} />
      <Skeleton variant="text" width={60} height={20} />
      <Skeleton variant="text" width={60} height={20} />
    </Box>
  );
};

export default BreadcrumbSkeleton;
