import type { Adapter } from "better-auth";
import type { DB } from "./types";
import { generateSchema } from "./generate-schema";
import { getConvexPath } from "./generate-schema/utils";
import path from "node:path";

export type ConvexAdapterOptions = {
	schema_generation?: {
		/**
		 * The indentation level to use when generating the schema.
		 *
		 * @default 2
		 */
		indent?: number;
		/**
		 * The path to the `convex` directory.
		 * Can be either relative or absolute.
		 * If it's relative, then the path is relative to the directory which the BetterAuth CLI is ran.
		 *
		 * If you're running the CLI from the project root directory (where the convex directory lives), then you can skip this step.
		 */
		convex_dir_path?: string;
	};
};

export const convexAdapter = (
	db: DB,
	options: ConvexAdapterOptions = {},
): Adapter => {
	const { schema_generation = {} } = options;
	const { indent = 2, convex_dir_path: provided_convex_dir_path } =
		schema_generation;

	return {
		id: "convex",
		createSchema(options, file) {
			const convex_dir_path: string = getConvexPath(provided_convex_dir_path);
			const code = generateSchema(options.plugins || [], {
				indent,
				convex_dir_path,
			});
			return {
				code,
				path: path.join(convex_dir_path, "schema.ts"),
				append: false,
				overwrite: true,
			};
		},
	};
};
