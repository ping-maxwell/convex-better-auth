import type { AuthPluginSchema, BetterAuthPlugin } from "better-auth";

const imports = [
	`import { defineSchema, defineTable } from "convex/server";`,
	`import { v } from "convex/values";`,
].join("\n");

const gap = ``;
const defineSchema = `export default defineSchema({`;
const defineSchemaEnd = `});`;

export const generateSchema = (plugins: BetterAuthPlugin[]): string => {
	let all_schemas: string[] = [];

	const plugin_schemas: AuthPluginSchema[] = plugins.map((x) => x.schema || {});

	for (const plugin_schema of plugin_schemas) {
		// for each plugin
		if (Object.keys(plugin_schema).length === 0) continue;

		for (const [key, model] of Object.entries(plugin_schema)) {
			// for each schema within the plugin
			const modelName = model.modelName || key;

			let schema_start = `${modelName}: defineTable({\n`;
			let schema_body = ``;
			let schema_ending = `}),`;

			for (const [field_name, field] of Object.entries(model.fields)) {
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
				padding(`${schema_start}${padding(schema_body)}${schema_ending}`),
			);
		}
	}

	let code: string[] = [
		imports,
		gap,
		defineSchema,
		all_schemas.join("\n"),
		defineSchemaEnd,
	];

	return code.join(`\n`);
};

export function padding(str: string, indent: number = 2) {
	if (str.trim() === "") return "";
	return str
		.split("\n")
		.map((x) => (x.length > 0 ? `${" ".repeat(indent)}${x}` : x))
		.join("\n");
}
