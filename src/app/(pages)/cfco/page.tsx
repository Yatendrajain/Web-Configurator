"use client";

// import SubNav from "@/components/CommonSubNav";
// import CustomDropdown from "@/components/customDropdown";
// import CustomSearchBar from "@/components/CustomSearchBar";
// import AddIcon from "@mui/icons-material/Add";
// import { Box, Button } from "@mui/material";
// import { useAppDispatch, useAppSelector } from "@/app/hooks/reduxHooks";
// import {
//   setCFList,
//   setUploadedCfList,
//   setVersion,
//   toggleComparisonPopup,
//   updateWithUploadedData,
// } from "@/features/cfco/cfcoSlice";

import React, { useEffect, useState } from "react";
import PageContentWrapper from "@/components/PageWrapper";
import { useAppSelector } from "@/app/hooks/reduxHooks";
import CFCOExpandableTable from "@/components/CfCoTable";
import { fetchCfcoEntries } from "@/services/cfco/fetchCfcoEntries";
import { populateCfcoData } from "@/services/cfco/populateCfcoData";
import { CFData } from "@/interfaces/cfco";
import CommonLayout from "@/components/CommonLayout";

export default function Cfco() {
  const productTypeId = useAppSelector(
    (state) => state.productType.productTypeId,
  );
  const [cfcoData, setCfcoData] = useState<CFData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (!productTypeId) {
      setCfcoData([]);
      setError(null);
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setError(null);
      try {
        const rawList = await fetchCfcoEntries(productTypeId);
        const mapped = populateCfcoData(rawList);
        setCfcoData(mapped);
        setLoading(false);
      } catch (err: unknown) {
        if (
          err &&
          typeof err === "object" &&
          "message" in err &&
          typeof (err as { message?: unknown }).message === "string"
        ) {
          setError((err as { message: string }).message);
        } else {
          setError("Unknown error");
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [productTypeId]);

  return (
    <PageContentWrapper>
      <CommonLayout>
        <CFCOExpandableTable data={cfcoData} error={error} loading={loading} />
      </CommonLayout>
    </PageContentWrapper>
  );
}
