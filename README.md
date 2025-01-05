# Better Auth Convex Database Adapter

This is a database adapter for [Convex](https://www.convex.dev/) that allows you to use [BetterAuth](https://www.better-auth.com/) with Convex.

## Installation

```bash
npm install ba-convex-adapter
```

## Usage

```ts
import { ConvexAdapter } from 'ba-convex-adapter';

const adapter = new ConvexAdapter({
	convex: {
		host: 'localhost',
		port: 4444,
		timeout: 10000,
	},
});
```