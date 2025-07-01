"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import { setSearchQuery } from "@/app/store/searchSlice";

const ClearSearchOnRouteChange = () => {
  const dispatch = useDispatch();
  const pathname = usePathname();

  useEffect(() => {
    dispatch(setSearchQuery(""));
  }, [pathname, dispatch]);

  return null;
};

export default ClearSearchOnRouteChange;
