"use client";

import React, { useEffect, useState } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "@/styles/globals.scss";
import { CustomDropdownProps } from "@/interfaces/dropDown";
import { useAppDispatch } from "@/app/hooks/reduxHooks";
import {
  setProductTypeCode,
  setProductTypeName,
  setProductTypeId,
} from "@/features/productType/productTypeSlice";

interface Option {
  value: string;
  label: string;
  productTypeCode?: string;
}

interface ApiProductType {
  id: string;
  name: string;
  isActive?: boolean;
  productTypeCode?: string;
}

interface ApiVersion {
  id: string;
  versionName: string;
}

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
    if (safeAllOptions.length === 0) {
      const fetchOptions = async () => {
        try {
          if (fetchVersions) {
            // Fetch version data from backend
            const requestBody = {
              filters: {},
              includeFields: { lookupVersions: ["id", "versionName"] },
              orderBy: "desc",
              pageLimit: 100,
              page: 1,
            };
            const encodedData = encodeURIComponent(JSON.stringify(requestBody));
            const res = await fetch(
              `/api/lookup_versions/list?data=${encodedData}`,
            );
            const responseData = await res.json();
            if (!res.ok) throw new Error("Failed to fetch versions");
            const versions: ApiVersion[] = responseData?.list || [];
            const apiOptions: Option[] = versions.map((ver) => ({
              value: ver.id,
              label: ver.versionName,
            }));
            setOptions(apiOptions);
            if (apiOptions.length > 0) {
              setValue(apiOptions[0].value);
              if (onChange) onChange(apiOptions[0].value);
            }
            return;
          }
          // Default: fetch product types
          const requestBody = {
            filters: { productTypeCode: originProduct },
            includeFields: {
              productTypes: ["id", "name", "isActive", "productTypeCode"],
              users: ["name", "azureUserId"],
            },
            sortBy: "updatedAt",
            orderBy: "desc",
            includeUserDetails: true,
            maxPageLimit: true,
            pageLimit: 1,
            page: 1,
          };
          const encodedData = encodeURIComponent(JSON.stringify(requestBody));

          const res = await fetch(
            `/api/product_types/list?data=${encodedData}`,
          );

          const responseData = await res.json();

          if (!res.ok) throw new Error("Failed to fetch product types");
          const productTypes: ApiProductType[] = responseData?.list || [];
          const apiOptions: Option[] = productTypes.map((type) => ({
            value: type.id,
            label: type.name,
            productTypeCode: type.productTypeCode,
          }));

          setOptions(apiOptions);

          if (apiOptions.length > 0) {
            setValue(apiOptions[0].value);
            dispatch(setProductTypeCode(apiOptions[0].productTypeCode || ""));
            dispatch(setProductTypeName(apiOptions[0].label || ""));
            dispatch(setProductTypeId(apiOptions[0].value));
            if (onChange) onChange(apiOptions[0].value);
          }
        } catch (error) {
          console.error("Error fetching product types or versions:", error);
        }
      };
      fetchOptions();
    }
  }, [originProduct, dispatch, safeAllOptions.length, fetchVersions, onChange]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const selected = options.find((opt) => opt.value === event.target.value);
    if (selected) {
      setValue(selected.value);
      dispatch(setProductTypeCode(selected.productTypeCode || ""));
      dispatch(setProductTypeName(selected.label || ""));
      dispatch(setProductTypeId(selected.value));
      if (onChange) onChange(selected.value);
    }
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
        IconComponent={() => <ExpandMoreIcon className="custom-select-icon" />}
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
            style: { minWidth: width, maxWidth: 400 },
          },
        }}
      >
        {options.map(({ value, label }) => (
          <MenuItem
            key={value}
            value={value}
            style={{
              maxWidth: 380,
              overflow: "visible",
              whiteSpace: "normal",
              textOverflow: "initial",
              wordBreak: "break-word",
            }}
            title={label}
          >
            {label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CustomDropdown;
