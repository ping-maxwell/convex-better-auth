import { ConvexClient } from "convex/browser";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { insertDb, queryDb } from "./src/transform";
import { queryBuilder } from "./src/convex_action";
import { stringToQuery, tokenize } from "./src/convex_action/helpers";

const client = new ConvexClient(process.env.CONVEX_URL as string);

// query();
// insert();
testStringToQuery();

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

function testStringToQuery() {
  const query = `q.eq(q.field("_id"), "jn704nwcv84m2vgacjx90rp4vd797x68")`;

  const r = tokenize(query);
  console.log(r);
}
