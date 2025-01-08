import { ConvexClient } from "convex/browser";
import type { Adapter, BetterAuthOptions } from "better-auth";
import type { ConvexAdapterOptions } from "./types";
import { generateSchema } from "./generate-schema";
import { createTransform } from "./transform";
import { anyApi } from "convex/server";

export const convexAdapter =
	(config: ConvexAdapterOptions = {}) =>
	(options: BetterAuthOptions): Adapter => {
		if (!process.env.CONVEX_URL)
			throw new Error('Please set "CONVEX_URL" to your .env file.');
		const client = new ConvexClient(process.env.CONVEX_URL as string);

		const { transformInput, getModelName, db } = createTransform({
			config,
			options,
			client,
		});

		return {
			id: "convex",
			async create({ data: values, model, select }) {
				const transformed = transformInput(values, model, "create");
				const res = db("insert");
				return res as any;
			},
			//@ts-expect-error - will be fixed in the next version of better-auth
			createSchema(options, file) {
				const code = generateSchema(options.plugins || []);
				return {
					code,
					path: "/convex/schema.ts",
					append: false,
					overwrite: true,
				};
			},
		};
	};
