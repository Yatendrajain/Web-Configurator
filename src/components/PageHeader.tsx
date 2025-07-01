"use client";

import { Box, Typography, Breadcrumbs } from "@mui/material";
import Link from "next/link";

type PageHeaderProps = {
  title: string;
  breadcrumbs: { label: string; href?: string }[];
  children?: React.ReactNode; // for search, filters, etc.
};

export default function PageHeader({
  title,
  breadcrumbs,
  children,
}: PageHeaderProps) {
  return (
    <Box sx={{ mb: 2, px: 2, pt: 2, borderBottom: "1px solid #eee" }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        {breadcrumbs.map(({ label, href }, idx) =>
          href ? (
            <Link
              key={idx}
              href={href}
              style={{ textDecoration: "none", color: "#666" }}
            >
              {label}
            </Link>
          ) : (
            <Typography key={idx} color="text.primary">
              {label}
            </Typography>
          ),
        )}
      </Breadcrumbs>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          {title}
        </Typography>
        <Box sx={{ mt: { xs: 2, md: 0 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
