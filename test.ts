import { ConvexHttpClient } from "convex/browser";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { queryBuilder, queryDb } from "./convex/betterAuth.js";

const client = new ConvexHttpClient(process.env.CONVEX_URL as string);

queryDb(client, {
  tableName: "users",
}).then(console.log);
