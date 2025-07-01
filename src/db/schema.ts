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

export const users = pgTable("users", {
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
});

export const productTypes = pgTable("product_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  productTypeCode: varchar("product_type_code", { length: 255 }).notNull(),
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
    comment1: text("comment_1"),
    comment2: text("comment_2"),
    extraInfo: jsonb("extra_info"),
    isDisabled: boolean("is_disabled").notNull().default(false),
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
    pipelineStatus: varchar("pipeline_status", { length: 255 }).notNull(),
    pipelineStatusUrl: varchar("pipeline_status_url", {
      length: 1000,
    }).notNull(),
    productNo: integer("product_no"),
    unitId: integer("unit_id"),
    dataServerArea: varchar("data_server_area", { length: 255 }),
    alarmServerArea: varchar("alarm_server_area", { length: 255 }),
    processArea: varchar("process_area", { length: 255 }),
    changedOrderData: jsonb("changed_order_data").notNull(),
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
      table.itemNumberVersion,
      table.submissionVersion,
    ),
  ],
);
