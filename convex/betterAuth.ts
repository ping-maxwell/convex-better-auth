import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexHandler, ConvexReturnType } from "./../src/convex_action";
import { DataModel } from "./_generated/dataModel";

const handler: ConvexReturnType = ConvexHandler<DataModel>({
  action,
  internalQuery,
  internal,
});

export const betterAuth = handler.betterAuth;
export const _query = handler._query;
