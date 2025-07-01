"use client";

import SubNav from "@/components/navbars/CommonSubNav";
import CustomDropdown from "@/components/customDropdown";
import CustomSearchBar from "@/components/CustomSearchBar";
import Icon from "@/components/IconConfig";
import UploadMasterDataModal from "./components/UploadMasterDataModal";
import { Box, Button } from "@mui/material";
import React, { useState, useEffect } from "react";

export default function CfcoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [productTypeId, setProductTypeId] = useState<string>("");

  useEffect(() => {}, [productTypeId]);

  return (
    <Box className="cfco-layout-container">
      <SubNav
        rightSection={
          <Box className="cfco-subnav-right">
            <Button
              variant="contained"
              startIcon={<Icon name="add" size={15} />}
              onClick={() => setModalOpen(true)}
              className="cfco-upload-btn"
            >
              Upload New Version
            </Button>

            <CustomSearchBar
              keyword="Identifier"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              sx={{ width: "20%", paddingInline: "0.7rem" }}
            />

            <CustomDropdown width={100} onChange={setProductTypeId} />
            <CustomDropdown width={100} fetchVersions={true} />
          </Box>
        }
      />

      <main
        className="main-content"
        style={{ height: "calc(100vh - 3rem) !important" }}
      >
        {React.isValidElement(children)
          ? React.cloneElement(
              children as React.ReactElement<Record<string, unknown>>,
              { productTypeId },
            )
          : children}
      </main>

      <UploadMasterDataModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
      {/* </CommonLayout> */}
    </Box>
  );
}
