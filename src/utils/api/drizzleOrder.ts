import { asc, desc } from "drizzle-orm";
import { ORDER_BY } from "@/constants/api/enums/orderBy";

export const getDrizzleOrder = (order: ORDER_BY.ASC | ORDER_BY.DESC) => {
  return order === ORDER_BY.ASC ? asc : desc;
};
