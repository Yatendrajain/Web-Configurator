import { Box } from "@mui/material";
import { ReactNode } from "react";

interface PageContentWrapperProps {
  children: ReactNode;
}

export default function PageContentWrapper({
  children,
}: PageContentWrapperProps) {
  return (
    <Box
      component="main"
      sx={{
        mb: "1rem",
        p: 1,
        position: "relative",
      }}
    >
      {children}
    </Box>
  );
}
