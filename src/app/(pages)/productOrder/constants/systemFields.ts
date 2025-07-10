import { FieldItem } from "@/interfaces/editProduct";
import { ProductDetailData } from "@/interfaces/editProduct";

export const systemField: FieldItem[] = [
  {
    label: "Product No.",
    key: "productNo",
    value: "",
  },
  {
    label: "Unit ID",
    key: "unitId",
    value: "",
  },
  {
    label: "Data Server Area",
    key: "dataServerArea",
    value: "",
  },
  {
    label: "Alarm Server Area",
    key: "alarmServerArea",
    value: "",
  },
  {
    label: "Process Area",
    key: "processArea",
    value: "",
  },
];

export const ProductDetail: ProductDetailData = {
  productType: "",
  orderId: "",
  cfcoVersion: "",
  finalizedAt: "",
  submissionHistory: "",
  version: 0,
};
