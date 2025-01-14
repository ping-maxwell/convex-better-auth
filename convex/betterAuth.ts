import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexHandler, ConvexReturnType } from "./../src/convex_action";
import { DataModel } from "./_generated/dataModel";

const { betterAuth, query } = ConvexHandler<DataModel>({
  action,
  internalQuery,
  internal,
}) as ConvexReturnType;

export { betterAuth, query };
