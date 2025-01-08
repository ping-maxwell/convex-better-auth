# Convex Database Adapter for Better-Auth

This is a database adapter for [Convex](https://www.convex.dev/) that allows you to use [BetterAuth](https://www.better-auth.com/) with Convex.

## Installation

```bash
npm install convex-database-adapter
```

## Usage

```ts
import { betterAuth } from "better-auth";
import { convexAdapter } from "./../src";
import { query, mutation } from "../convex/_generated/server";

export const auth = betterAuth({
  database: convexAdapter({ mutation, query }),
  plugins: [],
  //... other options
});
```
