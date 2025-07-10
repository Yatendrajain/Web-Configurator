"use client";

import SubNav from "@/components/navbars/CommonSubNav";
import CustomDropdown from "@/components/customDropdown";
import CustomSearchBar from "@/components/CustomSearchBar";
import Icon from "@/components/IconConfig";
import UploadMasterDataModal from "./components/UploadMasterDataModal";
import { Box, Button } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  clearCFCOSearchQuery,
  setCFCOSearchQuery,
} from "@/app/store/cfcoSearchSlice";
import { usePathname } from "next/navigation";

export default function CfcoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [productTypeId, setProductTypeId] = useState<string>("");

  useEffect(() => {}, [productTypeId]);

  const pathname = usePathname();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearCFCOSearchQuery());
  }, [dispatch, pathname]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
  };

  const onSearch = (event: string) => {
    const trimmed = event.trim();
    dispatch(setCFCOSearchQuery(trimmed));
  };

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
              onSearch={onSearch}
              onChange={(e) => handleChange(e)}
              sx={{ width: "20%", paddingInline: "0.7rem" }}
            />

            <CustomDropdown width={100} onChange={setProductTypeId} />
            <CustomDropdown width={150} fetchVersions={true} />
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
