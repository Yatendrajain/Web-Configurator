"use client";

import React, { useEffect, useState } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent,
} from "@mui/material";
import { CustomDropdownProps } from "@/interfaces/dropDown";
import { useAppDispatch } from "@/app/hooks/reduxHooks";
import {
  setProductTypeCode,
  setProductTypeName,
  setProductTypeId,
} from "@/features/productType/productTypeSlice";
import { CustomDropdownIcon } from "./customDropdownIcon";
import { fetchLookupVersions, fetchProductTypes } from "@/services/common";
import Cookies from "js-cookie";
// import { useProductTypes } from "@/services/productTypes/useProductTypes";
// import { ApiVersion } from "@/interfaces";

interface Option {
  value: string;
  label: string;
  productTypeCode?: string;
  subValue?: string;
}

// interface ApiProductType {
//   id: string;
//   name: string;S
//   isActive?: boolean;
//   productTypeCode?: string;
// }

// interface ApiVersion {
//   id: string;
//   versionName: string;
// }

const CustomDropdown: React.FC<
  CustomDropdownProps & {
    fetchVersions?: boolean;
    onChange?: (productTypeId: string) => void;
  }
> = ({
  style,
  width = 200,
  originProduct,
  allOptions = [],
  defaultOption = "",
  fetchVersions = false,
  onChange,
  disabled,
}) => {
  const safeDefaultOption = defaultOption || "";
  const safeAllOptions = allOptions || [];
  const [value, setValue] = useState<string>(safeDefaultOption);
  const [options, setOptions] = useState<Option[]>(
    safeAllOptions.length > 0
      ? [
          // { label: toLabel(safeDefaultOption), value: safeDefaultOption },
          ...safeAllOptions,
        ]
      : [],
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    const cookie: string = Cookies.get("productType") as string;
    const storedProductType = JSON.parse(cookie);

    const loadOptions = async () => {
      try {
        let options: Option[] = [];

        if (fetchVersions) {
          const versions = await fetchLookupVersions();

          options = versions.map((ver) => ({
            value: ver.id,
            label: ver.versionName,
            subValue: `Created by ${ver.userDetails?.name || "N/A"} <br/> Updated on ${new Date(
              ver.createdAt,
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}`,
          }));
        } else {
          options = await fetchProductTypes(originProduct);
        }

        setOptions(options);

        if (options.length > 0) {
          const first = options[0];
          setValue(
            !fetchVersions && storedProductType
              ? storedProductType.value
              : first.value,
          );
          onChange?.(first.value);

          if (!fetchVersions) {
            dispatch(setProductTypeCode(first.productTypeCode || ""));
            dispatch(setProductTypeName(first.label));
            dispatch(setProductTypeId(first.value));
          }
        }
      } catch (err) {
        console.error("Failed to load dropdown options:", err);
      }
    };

    if (!safeAllOptions?.length) {
      loadOptions();
    }
  }, [
    originProduct,
    dispatch,
    fetchVersions,
    onChange,
    safeAllOptions?.length, // ✅ Remove unnecessary dependency `productTypeOptions`
  ]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const selected = options.find((opt) => opt.value === event.target.value);
    if (selected) {
      setValue(selected.value);
      dispatch(setProductTypeCode(selected.productTypeCode || ""));
      dispatch(setProductTypeName(selected.label || ""));
      dispatch(setProductTypeId(selected.value));
      if (onChange) onChange(selected.value);
    }
    if (!fetchVersions && selected)
      Cookies.set("productType", JSON.stringify(selected), { expires: 365 });
  };

  return (
    <FormControl
      size="small"
      style={{ width: width, ...style, verticalAlign: "middle" }}
      className="custom-dropdown-form-control"
    >
      <Select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        renderValue={(selected) => {
          const selectedOption = options.find((opt) => opt.value === selected);
          return selectedOption?.label || "";
        }}
        input={
          <OutlinedInput
            notched={false}
            classes={{ root: "custom-select" }}
            sx={{
              "& .MuiSelect-select": {
                color: "#475466",
                fontWeight: 600,
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#475466",
              },
            }}
          />
        }
        IconComponent={CustomDropdownIcon}
        inputProps={{
          "aria-label": "Select Product Type",
          classes: { root: "custom-select-text" },
          style: {
            color: "#475466",
            fontWeight: 600,
          },
        }}
        MenuProps={{
          PaperProps: {
            className: "custom-select-menu",
            style: { minWidth: fetchVersions ? 250 : width, maxWidth: 400 },
          },
        }}
      >
        {options.map(({ value, label, subValue }) => (
          <MenuItem
            key={value}
            value={value}
            style={{
              maxWidth: 350,
              overflow: "visible",
              whiteSpace: "normal",
              textOverflow: "initial",
              wordBreak: "break-word",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
            title={label}
          >
            <span style={{ fontWeight: fetchVersions ? 500 : 600 }}>
              {label}
            </span>
            {fetchVersions && subValue && (
              <span
                style={{ fontSize: "12px", color: "#6B7280" }}
                dangerouslySetInnerHTML={{ __html: subValue }}
              />
            )}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CustomDropdown;
