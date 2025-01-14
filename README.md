# Convex Database Adapter for Better-Auth

This is a database adapter for [Convex](https://www.convex.dev/) that allows you to use [BetterAuth](https://www.better-auth.com/) with Convex.

## Installation

```bash
npm install convex-database-adapter
```

## Usage

### Add adapter to Better Auth instance

```ts
import { betterAuth } from "better-auth";
import { convexAdapter } from "convex-better-auth";

export const auth = betterAuth({
  database: convexAdapter({
    convex_url: process.env.CONVEX_URL,
  }),
  plugins: [],
  //... other options
});
```

### Create the Convex Handler

This allows our adapter to communicate with your Convex DB.

Create a new file in `convex/betterAuth.ts` and add the following code:

**NOTE:** It's important that the file name is exactly `betterAuth.ts` and that it is in the `convex` directory.

```ts
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
```