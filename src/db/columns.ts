import {
  users,
  productTypes,
  lookupVersions,
  lookupEntries,
  orderHistories,
  roleMappings,
  permissions,
  rolePermissions,
} from "@/db/schema";
import { getTableColumns } from "drizzle-orm";

export const usersColumnns = getTableColumns(users);
export const productTypesColumnns = getTableColumns(productTypes);
export const lookupVersionsColumnns = getTableColumns(lookupVersions);
export const lookupEntriesColumnns = getTableColumns(lookupEntries);
export const orderHistoriesColumnns = getTableColumns(orderHistories);
export const roleMappingsColumnns = getTableColumns(roleMappings);
export const permissionsColumnns = getTableColumns(permissions);
export const rolePermissionsColumnns = getTableColumns(rolePermissions);
