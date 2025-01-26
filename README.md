# Convex Database Adapter for Better-Auth

This is a database adapter for [Convex](https://www.convex.dev/) that allows you to use [BetterAuth](https://www.better-auth.com/) with Convex.

> [!CAUTION]
> This library is still in development and is not yet ready for production use.

## Installation

```bash
npm install convex-database-adapter
```

## Usage

### Initiate the Convex Database Adapter

Head over to your Better Auth server instance, and under `database`, add the `convexAdapter` function.

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

const { betterAuth, query } = ConvexHandler({
  action,
  internalQuery,
  internal,
}) as ConvexReturnType;

export { betterAuth, query };
```
