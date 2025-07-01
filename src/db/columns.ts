import {
  users,
  productTypes,
  lookupVersions,
  lookupEntries,
  orderHistories,
} from "@/db/schema";
import { getTableColumns } from "drizzle-orm";

export const usersColumnns = getTableColumns(users);
export const productTypesColumnns = getTableColumns(productTypes);
export const lookupVersionsColumnns = getTableColumns(lookupVersions);
export const lookupEntriesColumnns = getTableColumns(lookupEntries);
export const orderHistoriesColumnns = getTableColumns(orderHistories);
