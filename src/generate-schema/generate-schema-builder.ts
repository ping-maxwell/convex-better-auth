import type { AuthPluginSchema, BetterAuthPlugin } from "better-auth";
import type { FieldType, FieldAttribute } from "better-auth/db";
import { format } from "prettier";

export const generateSchemaBuilderStage = async ({
	code,
	plugins,
}: { code: string; plugins: BetterAuthPlugin[] }) => {
	let formatted_code = await format(code, { filepath: "schema.ts" });

	console.log(`formatted_code:`);
	console.log(formatted_code);

	const existing_schema = parse_existing_schema(formatted_code);

	return "";
};

//TODO: make unit tests for the regex to scan for `export default defineSchema({` or for `const schema = defineSchema({`.
const get_schema_regex = /defineSchema\({[^;]*;/gm;
const get_values = /([a-zA-Z0-9_]+): v.([a-zA-Z0-9_]+)\(\),/gm;
const get_table = /([a-zA-Z0-9_]+): defineTable\({[^}]*}\)/gm;

function parse_existing_schema(code: string): {
	pre: string;
	existing_schema: Record<string, FieldAttribute<FieldType>>;
	post: string;
} {
	let pre = "";
	let post = "";

	if (get_schema_regex.test(code)) {
		const existing_schema = code.match(get_schema_regex)?.[0] as string;
		pre = code.split(existing_schema)[0];
		post = code.split(existing_schema)[1];
		const schema_str: string = existing_schema
			.replace("export default defineSchema({", "")
			.replace("});", "");

		const tables = schema_str.match(get_table);
		console.log(`tables:`, tables);
	}

	return { post, pre, existing_schema: {} };
}

function convert_plugins_to_convex_schema(plugins: BetterAuthPlugin[]): string {
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

	return all_schemas.join("\n");
}
