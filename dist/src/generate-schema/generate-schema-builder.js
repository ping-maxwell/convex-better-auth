import { format } from "prettier";
//TODO: make unit tests for the regex to scan for `export default defineSchema({` or for `const schema = defineSchema({`.
const get_schema_regex = /defineSchema\({[^;]*;/gm;
const get_table = /([a-zA-Z0-9_]+): defineTable\({[^}]*}\)/gm;
const get_values = /([a-zA-Z0-9_]+): (v.[^,]*),/gm;
const get_types = /v\.([^(]*)[("]{2}([^")]*)|v\.([^(]*)/gm;
export const generateSchemaBuilderStage = async ({ code, plugins, }) => {
    const formatted_code = await format(code, { filepath: "schema.ts" });
    const { post, pre, tables } = parse_existing_schema(formatted_code);
    const convex_schema_str = convert_plugins_to_convex_schema(plugins, tables);
    return await format(`${pre}defineSchema({${convex_schema_str}})${post}`, {
        filepath: "schema.ts",
    });
};
function parse_existing_schema(code) {
    let pre = "";
    const tables = {};
    let post = "";
    if (get_schema_regex.test(code)) {
        const existing_schema = code.match(get_schema_regex)?.[0];
        pre = code.split(existing_schema)[0];
        post = code.split(existing_schema)[1];
        const schema_str = existing_schema
            .replace("export default defineSchema({", "")
            .replace("});", "");
        const tables_match = schema_str.match(get_table) || [];
        for (const table of tables_match) {
            const table_name = table.split(":")[0];
            tables[table_name] = {};
            let values = get_values.exec(table);
            while (values !== null) {
                const [, field_name, field_value] = values;
                const types = [...field_value.matchAll(get_types)].map((x) => {
                    if (x[1] === "id") {
                        return [
                            x[1] /*type*/,
                            x[2] /*if type is "id", then this will be the id name, else undefined*/,
                        ];
                    }
                    return [x[3] /*type*/, undefined];
                });
                tables[table_name][field_name] = {
                    type: types.find((x) => x[0] !== "optional")?.[0],
                    optional: !!types.find((x) => x[0] === "optional"),
                    name: field_name,
                };
                values = get_values.exec(table);
            }
        }
    }
    return { post, pre, tables };
}
function convert_plugins_to_convex_schema(plugins, existing_tables) {
    const plugin_schemas = plugins.map((x) => x.schema || {});
    const all_model_names = [];
    const all_schemas = [];
    for (const plugin_schema of plugin_schemas) {
        // for each plugin
        if (Object.keys(plugin_schema).length === 0)
            continue;
        for (const [key, model] of Object.entries(plugin_schema)) {
            // for each schema within the plugin
            const modelName = model.modelName || key;
            all_model_names.push(modelName);
            const existing_table = existing_tables[modelName];
            const schema_start = `${modelName}: defineTable({\n`;
            let schema_body = ``;
            const schema_ending = `}),`;
            const all_field_names = [];
            for (const [key_field_name, field] of Object.entries(model.fields)) {
                const field_name = field.fieldName || key_field_name;
                all_field_names.push(field_name);
                let type = "string";
                const isOptional = !field.required;
                if (field_name === "id" || field.references?.model)
                    type = "id";
                else if (field.type === "boolean")
                    type = "boolean";
                else if (field.type === "number")
                    type = "number";
                else if (field.type === "string")
                    type = "string";
                else if (field.type === "date")
                    type = "string";
                else if (field.type === "number[]" || field.type === "string[]")
                    type = "array";
                let contents = "";
                if (type === "id") {
                    if (field.references?.model)
                        contents = `"${field.references.model}"`;
                    else
                        contents = `"${modelName}"`;
                }
                schema_body += `${field_name}: ${isOptional && type !== "id" ? `v.optional(v.${type}(${contents}))` : `v.${type}(${contents})`},\n`;
            }
            if (existing_table) {
                for (const [field_name, field] of Object.entries(existing_table).filter((x) => !all_field_names.includes(x[0]))) {
                    const { type, optional } = field;
                    schema_body += `${field_name}: ${optional ? `v.optional(v.${type}())` : `v.${type}()`},\n`;
                }
            }
            all_schemas.push(`${schema_start}${schema_body}${schema_ending}`);
        }
    }
    all_schemas.splice(0, 0, convert_parsed_schema_to_convex_schema(Object.fromEntries(Object.entries(existing_tables).filter(([table_name, fields]) => !all_model_names.includes(table_name)))));
    return all_schemas.join("\n");
}
function convert_parsed_schema_to_convex_schema(parsed_schema) {
    let res = "";
    for (const [table_name, fields] of Object.entries(parsed_schema)) {
        res += `\n${table_name}: defineTable({\n`;
        for (const [field_name, field] of Object.entries(fields)) {
            const { type, optional } = field;
            res += `${field_name}: ${optional ? `v.optional(v.${type}())` : `v.${type}()`},\n`;
        }
        res += `}),`;
    }
    return res;
}
