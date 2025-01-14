import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexHandler, ConvexReturnType } from "./../src/convex_action";

const { betterAuth, query } = ConvexHandler({
  action,
  internalQuery,
  internal,
}) as ConvexReturnType;

export { betterAuth, query };
