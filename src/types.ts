import type { AnyDataModel, QueryBuilder } from "convex/server";

export type DB = QueryBuilder<AnyDataModel, "public">;
