import type { AuthPluginSchema, BetterAuthPlugin } from "better-auth";
import { padding } from "./utils";
import { format, type Options } from "prettier";

export const generateSchemaBuilderStage = async ({
	code,
	plugins,
}: { code: string; plugins: BetterAuthPlugin[] }) => {
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

			all_schemas.push(`${schema_start}${schema_body}${schema_ending}`);
		}
	}

	return await format(code, { filepath: "schema.ts" });
};
