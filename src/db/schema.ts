import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    azureUserId: varchar("azure_user_id", { length: 800 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("azure_user_id_unique").on(table.azureUserId)],
);

export const roleMappings = pgTable("role_mappings", {
  id: uuid("id").primaryKey().defaultRandom(),
  azureAdRole: varchar("azure_ad_role", { length: 255 }).notNull(),
  appRole: varchar("app_role", { length: 255 }).notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const permissions = pgTable(
  "permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    moduleName: varchar("module_name", { length: 255 }).notNull(),
    action: varchar("action", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("module_name_action_unique").on(table.moduleName, table.action),
  ],
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleMappingId: uuid("role_mapping_id")
      .notNull()
      .references(() => roleMappings.id),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id),
    grantedBy: uuid("granted_by")
      .notNull()
      .references(() => users.id),
    grantedAt: timestamp("granted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("role_mapping_id_permission_id_unique").on(
      table.roleMappingId,
      table.permissionId,
    ),
  ],
);

export const productTypes = pgTable("product_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  fileNameUsed: varchar("file_name_used", { length: 255 }).notNull(),
  productTypeCode: varchar("product_type_code", { length: 255 }).notNull(),
  activeLookupVersionId: uuid("active_lookup_version_id").notNull(),
  identifierCode: varchar("identifier_code", { length: 255 }),
  createdByUserId: uuid("created_by_user_id")
    .notNull()
    .references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const lookupVersions = pgTable(
  "lookup_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productTypeId: uuid("product_type_id")
      .notNull()
      .references(() => productTypes.id),
    versionName: varchar("version_name", { length: 10 }).notNull(),
    uploadedByUserId: uuid("uploaded_by_user_id")
      .notNull()
      .references(() => users.id),
    remarks: text("remarks"),
    fileName: varchar("file_name", { length: 255 }),
    fileLocation: varchar("file_location", { length: 800 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("lookup_versions_product_type_id_version_name_unique").on(
      table.productTypeId,
      table.versionName,
    ),
  ],
);

export const lookupEntries = pgTable(
  "lookup_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lookupVersionId: uuid("lookup_version_id")
      .notNull()
      .references(() => lookupVersions.id),
    parent: varchar("parent", { length: 255 }).notNull(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 }).notNull(),
    inputType: varchar("input_type", { length: 255 }).notNull(),
    description: text("description"),
    comment: text("comment"),
    extraInfo: jsonb("extra_info"),
  },
  (table) => [
    uniqueIndex("lookup_entries_lookup_version_id_identifier_unique").on(
      table.lookupVersionId,
      table.identifier,
    ),
  ],
);

export const orderHistories = pgTable(
  "order_histories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submissionVersion: varchar("submission_version", { length: 255 }).notNull(),
    itemNumber: varchar("item_number", { length: 255 }).notNull(),
    itemNumberVersion: varchar("item_number_version", {
      length: 255,
    }).notNull(),
    orderName: varchar("order_name", { length: 255 }).notNull(),
    clonedFromVersion: varchar("cloned_from_version", { length: 255 }),
    productTypeId: uuid("product_type_id")
      .notNull()
      .references(() => productTypes.id),
    lookupVersionId: uuid("lookup_version_id")
      .notNull()
      .references(() => lookupVersions.id),
    encodedOrderData: jsonb("encoded_order_data").notNull(),
    decodedOrderData: jsonb("decoded_order_data").notNull(),
    paxMajor: varchar("pax_major", { length: 255 }).notNull(),
    paxMinor: varchar("pax_minor", { length: 255 }).notNull(),
    pipelineStatus: varchar("pipeline_status", { length: 255 }),
    pipelineStatusUrl: varchar("pipeline_status_url", {
      length: 1000,
    }),
    productNo: varchar("product_no", { length: 255 }),
    unitId: integer("unit_id"),
    dataServerArea: varchar("data_server_area", { length: 255 }),
    alarmServerArea: varchar("alarm_server_area", { length: 255 }),
    processArea: varchar("process_area", { length: 255 }),
    encodedChangedOrderData: jsonb("encoded_changed_order_data").notNull(),
    decodedChangedOrderData: jsonb("decoded_changed_order_data").notNull(),
    remarks: text("remarks"),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("order_histories_item_number_submission_version_unique").on(
      table.itemNumber,
      table.submissionVersion,
    ),
  ],
);
