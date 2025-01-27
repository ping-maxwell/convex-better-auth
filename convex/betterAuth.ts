import { action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexHandler, type ConvexReturnType } from "./../src/convex_action";

const { betterAuth, query, insert } = ConvexHandler({
  action,
  internalQuery,
  internalMutation,
  internal,
}) as ConvexReturnType;

console.log("test", internal);

export { betterAuth, query, insert };
