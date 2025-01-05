import type { Adapter } from "better-auth";
import type { DB } from "./types";
import { generateSchema } from "./schema-schema";

export const convexAdapter = (db: DB): Adapter => {
  return {
    id: "convex",
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
