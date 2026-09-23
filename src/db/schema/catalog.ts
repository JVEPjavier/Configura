import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};
export const stores = pgTable(
  "stores",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    ...timestamps,
  },
  (table) => [uniqueIndex("stores_slug_idx").on(table.slug)],
);
export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    basePrice: integer("base_price").notNull(),
    currency: text("currency").notNull().default("CLP"),
    status: text("status").notNull().default("draft"),
    ...timestamps,
  },
  (table) => [uniqueIndex("products_store_slug_idx").on(table.storeId, table.slug)],
);
export const productOptions = pgTable("product_options", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  required: boolean("required").notNull().default(false),
  position: integer("position").notNull().default(0),
  ...timestamps,
});
export const optionValues = pgTable("option_values", {
  id: text("id").primaryKey(),
  optionId: text("option_id")
    .notNull()
    .references(() => productOptions.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  value: text("value").notNull(),
  priceDelta: integer("price_delta").notNull().default(0),
  position: integer("position").notNull().default(0),
  ...timestamps,
});
export const visibilityRules = pgTable("visibility_rules", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sourceOptionId: text("source_option_id")
    .notNull()
    .references(() => productOptions.id, { onDelete: "cascade" }),
  targetOptionId: text("target_option_id")
    .notNull()
    .references(() => productOptions.id, { onDelete: "cascade" }),
  condition: jsonb("condition").notNull(),
  ...timestamps,
});
