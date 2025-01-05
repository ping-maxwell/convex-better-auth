# Convex Database Adapter for Better-Auth

This is a database adapter for [Convex](https://www.convex.dev/) that allows you to use [BetterAuth](https://www.better-auth.com/) with Convex.

## Installation

```bash
npm install convex-database-adapter
```

## Usage

```ts
import { convexAdapter } from "convex-database-adapter";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: convexAdapter({
    host: "localhost",
    port: 4444,
  }),
  //...your config
});
```
