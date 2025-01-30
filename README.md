# Convex Database Adapter for Better-Auth

This is a database adapter for [Convex](https://www.convex.dev/) that allows you to use [BetterAuth](https://www.better-auth.com/) with Convex.

> [!CAUTION]
> Convex DB isn't designed for this. I've implemented work-arounds to allow for dynamic queries and mutations to work on Convex which traditionally isn't a thing.
> Furthermore, it has many limitations which Better Auth may require in certain areas. Some plugins may not work as intended.
>
> A list of limitations are as follows:
>
> - performnace issues: Since queries/mutations can't be dynamic, we essentially send a request to Convex Actions, to then call the mutate/query function. This alone is already 2 calls, not including the follow DB queries/mutation calls.
> - No support for `sortBy` queries. Better Auth requires this to be at a per `field` level, Convex does this at the table level.
> - Degraded performance for pagiantion queries. Convex doesn't support this very well as we're working out of their scope.
> - No support for operators such as `starts_with`, `ends_with`, or `contains`. Off the top of my head, only the admin plugin would be effected by this.

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
