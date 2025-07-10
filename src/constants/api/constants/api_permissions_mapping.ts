import { MODULE } from "@/constants/api/enums/module_names";
import { ACTION } from "@/constants/api/enums/actions";

export const PERMISSION_MAPPING = {
  "/api/lookup_entries/diff": [
    { moduleName: MODULE.API_LOOKUP_ENTRIES, action: ACTION.READ },
    { moduleName: MODULE.API_LOOKUP_ENTRIES, action: ACTION.INSERT },
  ],
  "/api/lookup_entries/list": [
    { moduleName: MODULE.API_LOOKUP_ENTRIES, action: ACTION.READ },
  ],
  "/api/lookup_entries/upload": [
    { moduleName: MODULE.API_LOOKUP_ENTRIES, action: ACTION.READ },
    { moduleName: MODULE.API_LOOKUP_ENTRIES, action: ACTION.INSERT },
  ],
  "/api/lookup_versions/list": [
    { moduleName: MODULE.API_LOOKUP_VERSIONS, action: ACTION.READ },
  ],
  "/api/migrations/run": [],
  "/api/order_histories/clone/get": [
    { moduleName: MODULE.API_ORDER_HISTORIES, action: ACTION.READ },
    { moduleName: MODULE.API_ORDER_HISTORIES, action: ACTION.INSERT },
  ],
  "/api/order_histories/clone/submit": [
    { moduleName: MODULE.API_ORDERS_DATA, action: ACTION.READ },
    { moduleName: MODULE.API_ORDER_HISTORIES, action: ACTION.READ },
    { moduleName: MODULE.API_ORDER_HISTORIES, action: ACTION.INSERT },
  ],
  "/api/order_histories/list": [
    { moduleName: MODULE.API_ORDER_HISTORIES, action: ACTION.READ },
  ],
  "/api/order_histories/view": [
    { moduleName: MODULE.API_ORDER_HISTORIES, action: ACTION.READ },
  ],
  "/api/orders_data/edit/get": [
    { moduleName: MODULE.API_ORDERS_DATA, action: ACTION.READ },
  ],
  "/api/orders_data/edit/submit": [
    { moduleName: MODULE.API_ORDERS_DATA, action: ACTION.READ },
    { moduleName: MODULE.API_ORDER_HISTORIES, action: ACTION.INSERT },
  ],
  "/api/orders_data/list": [
    { moduleName: MODULE.API_ORDERS_DATA, action: ACTION.READ },
  ],
  "/api/product_types/list": [
    { moduleName: MODULE.API_PRODUCT_TYPES, action: ACTION.READ },
  ],
  "/api/role_mappings/list": [],
} as Record<string, Array<{ moduleName: string; action: string }>>;
