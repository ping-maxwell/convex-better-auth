import type {
  ActionBuilder,
  GenericDataModel,
  QueryBuilder,
  RegisteredAction,
  RegisteredQuery,
} from "convex/server";
import { v } from "convex/values";
import { type QueryFilter, stringToQuery } from "./helpers";

export function queryBuilder(cb: QueryFilter) {
  return cb.toString().split(`=>`)[1].trimStart();
}

export type ConvexReturnType = {
  betterAuth: RegisteredAction<
    "public",
    {
      action: string;
      value: any;
    },
    Promise<any>
  >;
  query: RegisteredQuery<
    "internal",
    {
      tableName: string;
      query?: string;
      order?: "asc" | "desc";
      single?: boolean;
    },
    Promise<any>
  >;
};

export function ConvexHandler<
  DataModel extends GenericDataModel,
  Action extends ActionBuilder<DataModel, "public"> = ActionBuilder<
    DataModel,
    "public"
  >,
  Query extends QueryBuilder<DataModel, "internal"> = QueryBuilder<
    DataModel,
    "internal"
  >,
>({
  action,
  internalQuery,
  internal,
}: {
  action: Action;
  internalQuery: Query;
  internal: {
    betterAuth: {
      query: any;
    };
  };
}): ConvexReturnType {
  const betterAuth = action({
    args: { action: v.string(), value: v.any() },
    handler: async (ctx, args) => {
      if (args.action === "query") {
        const data = (await ctx.runQuery(internal.betterAuth.query, {
          query: args.value.query,
          tableName: args.value.tableName,
        })) as unknown as any;
        return data;
      }
    },
  });
  const query = internalQuery({
    args: {
      tableName: v.string(),
      query: v.optional(v.any()),
      /**
       * asc or desc
       */
      order: v.optional(v.string()),
      /**
       * Only get the first.
       */
      single: v.optional(v.boolean()),
    },
    handler: async (
      ctx,
      args: {
        tableName: string;
        query?: string;
        order?: "asc" | "desc";
        single?: boolean;
      }
    ) => {
      const query = ctx.db
        //@ts-ignore
        .query(args.tableName)
        .order(args.order || "asc")
        //@ts-ignore
        .filter((q) => {
          if (!args.query) return true;
          return stringToQuery(args.query, q);
        });

      if (args.single) return await query.first();
      return await query.collect();
    },
  });

  return { betterAuth, query };
}
