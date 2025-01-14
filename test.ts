import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import * as dotenv from "dotenv";
import { queryBuilder } from "./convex/betterAuth.js";
dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.CONVEX_URL as string);

client
  .action(api.betterAuth.betterAuth, {
    action: "query",
    value: {
      tableName: "users",
      query: queryBuilder((q) => q.eq(q.field("email"), "test@gmail.com")),
    },
  })
  .then(console.log);
