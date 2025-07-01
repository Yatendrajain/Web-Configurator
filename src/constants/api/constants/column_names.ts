import {
  productTypesColumnns,
  lookupEntriesColumnns,
  lookupVersionsColumnns,
  usersColumnns,
  orderHistoriesColumnns,
} from "@/db/columns";
import { createKeyMap } from "@/utils/api/create_key_map";

export const productTypesColNames = createKeyMap(productTypesColumnns);
export const lookupEntriesColNames = createKeyMap(lookupEntriesColumnns);
export const lookupVersionsColNames = createKeyMap(lookupVersionsColumnns);
export const usersColNames = createKeyMap(usersColumnns);
export const orderHistoriesColNames = createKeyMap(orderHistoriesColumnns);
