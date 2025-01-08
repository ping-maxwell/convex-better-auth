import type { Adapter, BetterAuthOptions } from "better-auth";
import type {
	ConvexAdapterOptions,
	ConvexMutation,
	ConvexQuery,
} from "./types";
import { generateSchema } from "./generate-schema";
import { createTransform } from "./transform";
import { BetterAuthError } from "node_modules/better-auth/dist/index.cjs";

export const convexAdapter =
	(
		{
			query: convex_query,
			mutation,
		}: { query: ConvexQuery; mutation: ConvexMutation },
		config: ConvexAdapterOptions = {},
	) =>
	(options: BetterAuthOptions): Adapter => {
		const {
			transformInput,
			getSchema,
			transformOutput,
			withReturning,
			getModelName,
		} = createTransform(convex_query, mutation, config, options);

		return {
			id: "convex",
			async create({ data: values, model, select }) {
				const transformed = transformInput(values, model, "create");
				const schemaModel = getSchema(model);
				checkMissingFields(schemaModel, getModelName(model), transformed);

				const builder = db.insert(schemaModel).values(transformed);
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
			"Drizzle adapter failed to initialize. Schema not found. Please provide a schema object in the adapter options object.",
		);
	}
	for (const key in values) {
		if (!schema[key]) {
			throw new BetterAuthError(
				`The field "${key}" does not exist in the "${model}" schema. Please update your drizzle schema or re-generate using "npx @better-auth/cli generate".`,
			);
		}
	}
}
