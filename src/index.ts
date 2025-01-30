import { ConvexClient } from "convex/browser";
import type { Adapter, AdapterInstance, BetterAuthOptions } from "better-auth";
import type { ConvexAdapterOptions } from "./types";
import { generateSchema } from "./generate-schema";
import { createTransform } from "./transform";
import { queryBuilder } from "./convex_action/index";
import type { PaginationResult } from "convex/server";

export * from "./convex_action/index";

export type ConvexAdapter = (config: ConvexAdapterOptions) => AdapterInstance;

export const convexAdapter: ConvexAdapter = (config: ConvexAdapterOptions) => {
  function debugLog(message: any[]) {
    if (config.enable_debug_logs) {
      console.log(`[convex-better-auth]`, ...message);
    }
  }

  return (options: BetterAuthOptions): Adapter => {
    let client: ConvexClient;
    const connect_to_convext_start_time = Date.now();
    try {
      debugLog(["Connecting to Convex..."]);
      client = new ConvexClient(config.convex_url);
      debugLog([
        "Connected to Convex",
        `${Date.now() - connect_to_convext_start_time}ms`,
      ]);
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
        const start = Date.now();
        debugLog(["create", { model, values, select }]);
        const transformed = transformInput(values, model, "create");
        const res = await db({
          action: "insert",
          tableName: model,
          values: transformed,
        });
        let result: Record<string, any> | null = null;

        if (!select || select.length === 0) result = res;
        else {
          result = {};
          for (const key of select) {
            result[key] = res[key];
          }
        }
        debugLog([
          "create result",
          { result, duration: `${Date.now() - start}ms` },
        ]);
        return result ? (transformOutput(result) as any) : result;
      },
      findOne: async ({ model, where, select }) => {
        const start = Date.now();
        filterInvalidOperators(where);
        where = transformWhereOperators(where);
        debugLog(["findOne", { model, where, select }]);
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
        result = result ? (transformOutput(result) as any) : result;
        debugLog([
          "findOne result",
          { result, duration: `${Date.now() - start}ms` },
        ]);
        return result as any;
      },
      update: async ({ model, where, update }) => {
        const start = Date.now();
        filterInvalidOperators(where);
        where = transformWhereOperators(where);
        debugLog(["update", { model, where, update }]);

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
        const result = transformOutput(res) as any;
        debugLog([
          "update result",
          { result, duration: `${Date.now() - start}ms` },
        ]);
        return result;
      },
      async findMany({ model, where, limit, offset, sortBy }) {
        const start = Date.now();
        filterInvalidOperators(where);
        where = transformWhereOperators(where);
        debugLog(["findMany", { model, where, limit, offset, sortBy }]);

        const queryString =
          where && where.length > 0
            ? queryBuilder((q) => {
                const eqs = where.map((w) =>
                  //@ts-ignore
                  q[w.operator || "eq"](w.field, w.value),
                );
                if (eqs.length === 1) return eqs[0];
                return eqs.reduce((acc, cur, indx) =>
                  q[
                    (where[indx - 1].connector || "AND").toLowerCase() as
                      | "and"
                      | "or"
                  ](acc, cur),
                );
              })
            : null;
        debugLog(["findMany queryString", { queryString }]);
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
            debugLog(["findMany paginated page", { page: opts.page }]);
            if (results.length >= offset + (limit || 1)) {
              isDone = true;
              const result = (
                limit
                  ? results.slice(offset, offset + limit)
                  : results.slice(offset)
              ).map((x) => transformOutput(x));
              debugLog([
                "findMany pagination done",
                { result, duration: `${Date.now() - start}ms` },
              ]);
              return result;
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
          const result = res.map((x: any) => transformOutput(x));
          debugLog([
            "findMany result",
            { result, duration: `${Date.now() - start}ms` },
          ]);
          return result;
        }
      },
      updateMany: async ({ model, where, update }) => {
        const start = Date.now();
        filterInvalidOperators(where);
        where = transformWhereOperators(where);
        debugLog(["updateMany", { model, where, update }]);

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
        const result = transformOutput(res) as any;
        debugLog([
          "updateMany result",
          { result, duration: `${Date.now() - start}ms` },
        ]);
        return result;
      },
      delete: async ({ model, where }) => {
        const start = Date.now();
        filterInvalidOperators(where);
        where = transformWhereOperators(where);
        debugLog(["delete", { model, where }]);

        await db({
          action: "delete",
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
        });
        debugLog(["delete complete", { duration: `${Date.now() - start}ms` }]);
        return;
      },
      deleteMany: async ({ model, where }) => {
        const start = Date.now();
        filterInvalidOperators(where);
        where = transformWhereOperators(where);
        debugLog(["deleteMany", { model, where }]);

        const res = await db({
          action: "delete",
          tableName: model,
          deleteAll: true,
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
        });
        debugLog([
          "deleteMany result",
          { result: res, duration: `${Date.now() - start}ms` },
        ]);
        return res as number;
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
};
