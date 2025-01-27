import { ConvexClient } from "convex/browser";
import type { Adapter, BetterAuthOptions } from "better-auth";
import type { ConvexAdapterOptions } from "./types";
import { generateSchema } from "./generate-schema";
import { createTransform } from "./transform";
import { queryBuilder } from "./convex_action/index";

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
    const { transformInput, getModelName, db, transformOutput } =
      createTransform({
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
        // console.log(`FindOne:`, { model, where, select });
        const res = (
          await db({
            action: "query",
            tableName: model,
            query: queryBuilder((q) => {
              const eqs = where.map((w) =>
                q.eq(w.field === "id" ? "_id" : w.field, w.value),
              );
              return eqs.reduce((acc, cur) => q.and(acc, cur));
            }),
            single: true,
          })
        )[0];

        let result: Record<string, any> | null = null;

        if (!select || select.length === 0) result = res;
        else {
          result = {};
          for (const key of select) {
            result[key] = res[key];
          }
        }

        return result as any;
      },
      update: async ({ model, where, update }) => {
        console.log(`Update:`, { model, where, update });
        const transformed = transformInput(update, model, "update");
        const res = await db({
          action: "update",
          tableName: model,
          query: queryBuilder((q) => {
            const eqs = where.map((w) =>
              q.eq(w.field === "id" ? "_id" : w.field, w.value),
            );
            return eqs.reduce((acc, cur) => q.and(acc, cur));
          }),
          update: transformed,
        });
        console.log(`Update result:`, res);
        return transformOutput(res) as any;
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
