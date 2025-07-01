"use client";

import React, {
  cloneElement,
  isValidElement,
  ReactElement,
  useState,
} from "react";
import CommonLayout from "@/components/CommonLayout";
import SubNav from "@/components/navbars/CommonSubNav";
import CustomDropdown from "@/components/customDropdown";
import CustomSearchBar from "@/components/CustomSearchBar";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { setSearchQuery } from "@/app/store/searchSlice";
import ClearSearchOnRouteChange from "@/components/ClearSearchOnRouteChange";

type HistoryChildProps = {
  searchValue: string;
};

export default function HistoryLayout({
  children,
}: {
  children: ReactElement<HistoryChildProps>;
  modal?: React.ReactNode;
}) {
  const [searchValue, setSearchValue] = useState("");
  const pathname = usePathname();
  const showRightSection = pathname === "/history";
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
    <CommonLayout>
      <SubNav
        rightSection={
          showRightSection ? (
            <>
              <CustomDropdown />
              <CustomSearchBar
                keyword="Order history"
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
      <div>
        {" "}
        {isValidElement(children)
          ? cloneElement(children, { searchValue })
          : children}
      </div>
    </CommonLayout>
  );
}
