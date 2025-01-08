import { ConvexClient } from "convex/browser";
import type { Adapter, BetterAuthOptions } from "better-auth";
import type {
	ConvexAdapterOptions,
} from "./types";
import { generateSchema } from "./generate-schema";
import { createTransform } from "./transform";
import { BetterAuthError } from "node_modules/better-auth/dist/index.cjs";
import { anyApi } from "convex/server";

export const convexAdapter =
	(config: ConvexAdapterOptions = {}) =>
	(options: BetterAuthOptions): Adapter => {
		if (!process.env.CONVEX_URL)
			throw new Error('Please set "CONVEX_URL" to your .env file.');
		const client = new ConvexClient(process.env.CONVEX_URL as string);

		const {
			transformInput,
			getSchema,
			transformOutput,
			withReturning,
			getModelName,
			db,
		} = createTransform({
			config,
			options,
			client,
		});

		return {
			id: "convex",
			async create({ data: values, model, select }) {
				const transformed = transformInput(values, model, "create");
				const schemaModel = getSchema(model);
				checkMissingFields(schemaModel, getModelName(model), transformed);

				const builder = db("insert");
				const returned = await withReturning(model, builder, transformed);
				return transformOutput(returned, model);
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

function checkMissingFields(
	schema: Record<string, any>,
	model: string,
	values: Record<string, any>,
) {
	if (!schema) {
		throw new BetterAuthError(
			"Convex adapter failed to initialize. Schema not found. Please provide a schema object in the adapter options object.",
		);
	}
	for (const key in values) {
		if (!schema[key]) {
			throw new BetterAuthError(
				`The field "${key}" does not exist in the "${model}" schema. Please update your Convex schema or re-generate using "npx @better-auth/cli generate".`,
			);
		}
	}
}
