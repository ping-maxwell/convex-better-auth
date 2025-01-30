import type {
  AnyDataModel,
  MutationBuilder,
  QueryBuilder,
} from "convex/server";

export type ConvexQuery = QueryBuilder<AnyDataModel, "public">;

export type ConvexAdapterOptions = {
  convex_url: string;
  convex_dir_path?: string;
};

export type ConvexMutation = MutationBuilder<AnyDataModel, "public">;
