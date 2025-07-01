"use client";

import React, { useState } from "react";
import CommonLayout from "@/components/CommonLayout";
import SubNav from "@/components/navbars/CommonSubNav";
import CustomDropdown from "@/components/customDropdown";
import CustomSearchBar from "@/components/CustomSearchBar";
import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import styles from "@/app/(pages)/productOrder/productOrder.module.scss";
import { useDispatch } from "react-redux";
import { setSearchQuery } from "@/app/store/searchSlice";
import ClearSearchOnRouteChange from "@/components/ClearSearchOnRouteChange";

export default function ProductOrderLayout({
  children,
}: {
  children: React.ReactNode;
  modal?: React.ReactNode;
}) {
  const pathname = usePathname();
  const showRightSection = pathname === "/productOrder";
  const [searchValue, setSearchValue] = useState("");
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
  };

  const onSearch = (event: string) => {
    const trimmed = event.trim();
    dispatch(setSearchQuery(trimmed));
  };

  return (
    <Box className={styles.productOrderLayout}>
      <SubNav
        rightSection={
          showRightSection ? (
            <>
              <CustomDropdown />
              <CustomSearchBar
                keyword="Order ID"
                value={searchValue}
                onSearch={onSearch}
                sx={{ paddingInline: "0.7rem" }}
                onChange={(e) => handleChange(e)}
              />
            </>
          ) : null
        }
      />
      <ClearSearchOnRouteChange />
      <CommonLayout>
        <main
          className={
            showRightSection
              ? "main-content-productOrder"
              : "main-content-deep-nesting"
          }
        >
          {children}
        </main>
      </CommonLayout>
    </Box>
    // </CommonLayout>
  );
}
