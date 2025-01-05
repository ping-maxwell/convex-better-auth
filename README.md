# Convex Database Adapter for Better-Auth

This is a database adapter for [Convex](https://www.convex.dev/) that allows you to use [BetterAuth](https://www.better-auth.com/) with Convex.

## Installation

```bash
npm install convex-database-adapter
```

## Usage

```ts
import { ConvexAdapter } from "convex-database-adapter";

const adapter = new ConvexAdapter({
  convex: {
    host: "localhost",
    port: 4444,
    timeout: 10000,
  },
});
```
