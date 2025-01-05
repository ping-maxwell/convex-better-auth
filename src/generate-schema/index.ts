import type { AuthPluginSchema, BetterAuthPlugin } from "better-auth";
import { getConvexPath, padding } from "./utils";
import { getConvexSchema } from "./get-convex-schema";
import { generateImportStage } from "./generate-imports";
import { generateSchemaBuilderStage } from "./generate-schema-builder";

const defineSchema = `export default defineSchema({`;
const defineSchemaEnd = `});`;

export const generateSchema = async (
	plugins: BetterAuthPlugin[],
	options: { indent?: number; convex_dir_path: string } = {
		convex_dir_path: "./convex",
	},
): Promise<string> => {
	const { indent = 2, convex_dir_path } = options;

	const existing_schema_code: string = await getConvexSchema(convex_dir_path);

	const all_schemas: string[] = [];
	const plugin_schemas: AuthPluginSchema[] = plugins.map((x) => x.schema || {});

	for (const plugin_schema of plugin_schemas) {
		// for each plugin
		if (Object.keys(plugin_schema).length === 0) continue;

		for (const [key, model] of Object.entries(plugin_schema)) {
			// for each schema within the plugin
			const modelName = model.modelName || key;

			const schema_start = `${modelName}: defineTable({\n`;
			let schema_body = ``;
			const schema_ending = `}),`;

			for (const [key_field_name, field] of Object.entries(model.fields)) {
				const field_name = field.fieldName || key_field_name;
				let type: "boolean" | "id" | "null" | "number" | "string" | "array" =
					"id";

				if (field_name === "id") type = "id";
				else if (field.type === "boolean") type = "boolean";
				else if (field.type === "number") type = "number";
				else if (field.type === "string") type = "string";
				else if (field.type === "date") type = "string";
				else if (field.type === "number[]" || field.type === "string[]")
					type = "array";

				schema_body += `${field_name}: v.${type}(),\n`;
			}

			all_schemas.push(
				padding(
					`${schema_start}${padding(schema_body, indent)}${schema_ending}`,
					indent,
				),
			);
		}
	}

	// Step 1. Ensure that the imports are present
	let code: string = generateImportStage(existing_schema_code);
	// Step 2. Add scham code to the defineSchema export
	code = generateSchemaBuilderStage(code);

	return code;
};
