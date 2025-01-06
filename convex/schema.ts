import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    author: v.string(),
    body: v.optional(v.boolean()),
    test2: v.string(),
    stringOrNumber: v.union(v.string(), v.number()),

  }),
});
