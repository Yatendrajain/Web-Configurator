import { ACTION } from "../enums/actions";
import { MODULE } from "../enums/module_names";

export const FEAT_PERMISSION_MAPPING = {
  "/api/orders_data/edit/submit": {
    edit_pax_tag: [
      { moduleName: MODULE.API_EDIT_PAGE_PAX_TAG, action: ACTION.INSERT },
    ],
  },
  "/api/order_histories/edit/submit": {
    edit_pax_tag: [
      { moduleName: MODULE.API_CLONE_PAGE_PAX_TAG, action: ACTION.INSERT },
    ],
  },
} as Record<
  string,
  Record<string, Array<{ moduleName: string; action: string }>>
>;
