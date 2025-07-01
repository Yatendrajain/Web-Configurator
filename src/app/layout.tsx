"use client";

import { ReactNode } from "react";
import TopNavbar from "@/components/navbars/TopNavbar";
import SideNavbar from "@/components/navbars/SideNavbar";
import { Box, Toolbar } from "@mui/material";
import { SessionProvider } from "next-auth/react";
import Providers from "./providers";

const drawerWidth = 250;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <SessionProvider>
        <body
          style={{
            margin: 0,
            padding: 0,
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <Providers>
            {/* Top Navbar */}
            <Box
              component="header"
              sx={{
                flexShrink: 0,
                backgroundColor: "#FFFFFF",
              }}
            >
              <TopNavbar />
            </Box>

            {/* Main Layout */}
            <Box
              sx={{
                display: "flex",
                height: "100vh", // Adjust based on TopNavbar height
                overflow: "hidden",
              }}
            >
              {/* Sidebar */}
              <Box
                sx={{
                  width: drawerWidth,
                  flexShrink: 0,
                  borderRight: "1px solid #ddd",
                  overflowY: "auto",
                }}
              >
                <SideNavbar />
              </Box>

              {/* Page Content */}
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "#F2F4F8",
                }}
              >
                {/* Top spacer for nav height */}
                <Toolbar variant="dense" />

                {/* Scrollable content */}
                <Box
                  sx={{
                    flexGrow: 1,
                    padding: "1rem",
                  }}
                >
                  {children}
                </Box>
              </Box>
            </Box>
          </Providers>
        </body>
      </SessionProvider>
    </html>
  );
}
