"use client";

import React from "react";
import { InputBase, Box } from "@mui/material";
import { styled } from "@mui/system";
import Icon from "@/components/IconConfig";

const SearchContainer = styled(Box)<{ customsx?: object }>(({ customsx }) => ({
  display: "flex",
  alignItems: "center",
  border: "1.2px solid #D0D5DD",
  borderRadius: 8,
  paddingLeft: "8px",
  backgroundColor: "white",
  width: 170,
  height: 32,
  ...(customsx || {}),
}));

const StyledInput = styled(InputBase)(() => ({
  marginLeft: 8,
  flex: 1,
  fontSize: "12px",
  fontFamily: '"Inter", sans-serif',
  fontWeight: 600,
  lineHeight: "16px",
  "& input": {
    color: "#475466",
    fontFamily: '"Inter", sans-serif',
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "16px",
    "&::placeholder": {
      color: "#475466",
      opacity: 1,
      fontWeight: 600,
    },
  },
}));

type CustomSearchBarProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (value: string) => void;
  keyword?: string;
  sx?: React.CSSProperties | object;
};

const CustomSearchBar: React.FC<CustomSearchBarProps> = ({
  value,
  onChange,
  onSearch,
  keyword = "",
  sx,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(value);
    }
  };

  const hanndleOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    if (onSearch) {
      const newValue = e.target.value.trim();
      if (newValue === "") {
        onSearch("");
      }
    }
  };

  const placeholderText = keyword ? `Search ${keyword}` : "Search";

  return (
    <SearchContainer customsx={sx}>
      <StyledInput
        placeholder={placeholderText}
        value={value}
        classes={{ root: "custom-select" }}
        onChange={hanndleOnchange}
        onKeyPress={handleKeyPress}
        inputProps={{ "aria-label": `search-${keyword?.toLowerCase() || ""}` }}
      />
      <span
        onClick={() => onSearch && onSearch(value)}
        style={{ cursor: "pointer" }}
      >
        <Icon name="search" size={15} />
      </span>
    </SearchContainer>
  );
};

export default CustomSearchBar;
