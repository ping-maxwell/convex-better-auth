import type {
	AnyDataModel,
	MutationBuilder,
	QueryBuilder,
} from "convex/server";

export type ConvexQuery = QueryBuilder<AnyDataModel, "public">;

export type ConvexAdapterOptions = {
	convex_dir_path?: string;
	usePlural?: boolean;
	schema?: Record<string, any>;
	advanced?: {
		generateId?: (data: Record<string, any>) => string;
	};
};

export type ConvexMutation = MutationBuilder<AnyDataModel, "public">;
