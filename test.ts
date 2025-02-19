import { ConvexClient } from "convex/browser";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { insertDb, queryDb } from "./src/transform";
import { queryBuilder } from "./src/convex_action";

const client = new ConvexClient(process.env.CONVEX_URL as string);

// query();
// insert();

function query() {
  console.time("query");
  queryDb(client, {
    tableName: "user",
    query: queryBuilder((q) => q.eq("id", "1")),
    single: true,
  }).then((res) => {
    console.log(res);
    console.timeEnd("query");
  });
}

function insert() {
  console.time("insert");
  insertDb(client, {
    tableName: "user",
    values: {
      email: "test@test.com",
      username: "test",
      followers: 10,
    },
  }).then((res) => {
    console.log(res);
    console.timeEnd("insert");
  });
}
