import { useEffect, useState } from "react";
import { Option } from "@/interfaces/productType";
import { fetchProductTypes } from "./fetchProductTypes";

export const useProductTypes = (originProduct?: string) => {
  const [productTypeOptions, setProductTypeOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProductTypes = async () => {
      setLoading(true);
      try {
        const options = await fetchProductTypes(originProduct);
        setProductTypeOptions(options);
      } catch (error) {
        console.error("Error loading product types:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProductTypes();
  }, [originProduct]);

  return { productTypeOptions, loading };
};
