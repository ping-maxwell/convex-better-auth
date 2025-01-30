import { ConvexClient } from "convex/browser";
import type { Adapter, BetterAuthOptions } from "better-auth";
import type { ConvexAdapterOptions } from "./types";
import { generateSchema } from "./generate-schema";
import { createTransform } from "./transform";
import { queryBuilder } from "./convex_action/index";
import type { PaginationResult } from "convex/server";

export * from "./convex_action/index";

export const convexAdapter =
  (config: ConvexAdapterOptions) =>
  (options: BetterAuthOptions): Adapter => {
    let client: ConvexClient;
    try {
      client = new ConvexClient(config.convex_url);
    } catch (error) {
      throw new Error(
        `[ConvexAdapter] Could not connect to Convex, make sure your config.convex_url is set properly. ${error}`,
      );
    }
    const {
      transformInput,
      filterInvalidOperators,
      db,
      transformOutput,
      transformWhereOperators,
    } = createTransform({
      config,
      options,
      client,
    });

    return {
      id: "convex",
      async create({ data: values, model, select }) {
        const transformed = transformInput(values, model, "create");
        const res = await db({
          action: "insert",
          tableName: model,
          values: transformed,
        });
        return transformOutput(res) as any;
      },
      findOne: async ({ model, where, select }) => {
        filterInvalidOperators(where);
        where = transformWhereOperators(where);
        // console.log(`FindOne:`, { model, where, select });
        const res = await db({
          action: "query",
          tableName: model,
          query: queryBuilder((q) => {
            const eqs = where.map((w) => q.eq(w.field, w.value));
            return eqs.reduce((acc, cur, indx) =>
              q[
                (where[indx - 1].connector || "AND").toLowerCase() as
                  | "and"
                  | "or"
              ](acc, cur),
            );
          }),
          single: true,
        });

        let result: Record<string, any> | null = null;

        if (!select || select.length === 0) result = res;
        else {
          result = {};
          for (const key of select) {
            result[key] = res[key];
          }
        }
        // console.log(`Result:`, result);
        return result as any;
      },
      update: async ({ model, where, update }) => {
        // console.log(`Update:`, { model, where, update });
        filterInvalidOperators(where);
        where = transformWhereOperators(where);
        console.log(`Where:`, where);

        const transformed = transformInput(update, model, "update");
        const res = await db({
          action: "update",
          tableName: model,
          query: queryBuilder((q) => {
            const eqs = where.map((w) =>
              //@ts-ignore
              q[w.operator || "eq"](w.field, w.value),
            );
            return eqs.reduce((acc, cur, indx) =>
              q[
                (where[indx - 1].connector || "AND").toLowerCase() as
                  | "and"
                  | "or"
              ](acc, cur),
            );
          }),
          update: transformed,
        });
        return transformOutput(res) as any;
      },
      async findMany({ model, where, limit, offset, sortBy }) {
        filterInvalidOperators(where);
        where = transformWhereOperators(where);
        console.log(`Find many:`, { model, where });

        const queryString = where
          ? queryBuilder((q) => {
              const eqs = where.map((w) =>
                //@ts-ignore
                q[w.operator || "eq"](w.field, w.value),
              );
              return eqs.reduce((acc, cur, indx) => {
                return q[
                  (where[indx - 1].connector || "AND").toLowerCase() as
                    | "and"
                    | "or"
                ](acc, cur);
              });
            })
          : null;
        console.log(`QueryString:`, queryString);
        if (typeof offset === "number") {
          let continueCursor = undefined;
          let isDone = false;

          const results = [];

          while (!isDone) {
            const opts = (await db({
              action: "query",
              tableName: model,
              query: queryString ?? undefined,
              order: sortBy?.direction,
              single: false,
              limit: limit,
              paginationOpts: {
                numItems: 100,
                cursor: continueCursor,
              },
            })) as PaginationResult<any>;
            continueCursor = opts.continueCursor;
            results.push(...opts.page);
            if (results.length >= offset + (limit || 1)) {
              isDone = true;
              return limit
                ? results.slice(offset, offset + limit)
                : results.slice(offset);
            }
          }
        } else {
          const res = await db({
            action: "query",
            tableName: model,
            query: queryString ? queryString : undefined,
            order: sortBy?.direction,
            single: false,
            limit: limit,
          });
          return res;
        }
      },
      //@ts-expect-error - will be fixed in the next version of better-auth
      createSchema(options, file) {
        const code = generateSchema(options.plugins || []);
        return {
          code,
          path: "/convex/schema.ts",
          append: false,
          overwrite: true,
        };
      },
    };
  };
