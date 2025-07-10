"use client";

import React, { useEffect, useState } from "react";
import ProductTypePopup from "@/components/Modal/ProductType";
import Cookies from "js-cookie";

const ProductTypeProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const cookie = Cookies.get("productType");
    if (!cookie) {
      setOpen(true);
    }
  }, []);

  const handleProductTypeSelected = (productType: unknown) => {
    Cookies.set("productType", JSON.stringify(productType), { expires: 365 });
    setOpen(false);
  };

  return (
    <>
      {open ? (
        <ProductTypePopup
          open={open}
          onClose={() => setOpen(false)}
          originProduct=""
          onProductTypeSelected={handleProductTypeSelected}
        />
      ) : (
        children
      )}
    </>
  );
};

export default ProductTypeProvider;
