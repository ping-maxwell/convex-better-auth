import { internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const betterAuth = internalAction({
  args: { action: v.string(), value: v.any() },
  handler: async (ctx, args) => {
    if (args.action === "query") {
      const data = await ctx.runQuery(internal.betterAuth._BA_readData, {
        query: args.value,
        tableName: args.value.tableName,
      }) as unknown as any;
      return data
    }
  },
});

export const _BA_readData = internalQuery({
  args: { tableName: v.string(), query: v.any() },
  handler: async (ctx, args) => {
    //@ts-ignore
   return await ctx.db.query(args.tableName).collect();
  },
});
