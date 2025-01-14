import { ConvexClient } from "convex/browser";
import type { Adapter, BetterAuthOptions } from "better-auth";
import type { ConvexAdapterOptions } from "./types";
import { generateSchema } from "./generate-schema";
import { createTransform } from "./transform";
import { anyApi } from "convex/server";

export * from "./convex_action/index";

export const convexAdapter =
  (config: ConvexAdapterOptions) =>
  (options: BetterAuthOptions): Adapter => {
    let client: ConvexClient;
    try {
      client = new ConvexClient(config.convex_url);
    } catch (error) {
      throw new Error(
        `[ConvexAdapter] Could not connect to Convex, make sure your config.convex_url is set properly. ${error}`
      );
    }
    const { transformInput, getModelName, db } = createTransform({
      config,
      options,
      client,
    });

    return {
      id: "convex",
      async create({ data: values, model, select }) {
        const transformed = transformInput(values, model, "create");
        const res = db("insert");
        return res as any;
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
