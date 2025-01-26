import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexHandler, type ConvexReturnType } from "./../src/convex_action";

const { betterAuth, query, insert } = ConvexHandler({
  action,
  internalQuery,
  internal,
}) as ConvexReturnType;

export { betterAuth, query, insert };
