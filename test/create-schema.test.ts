import { generateSchema } from "../src/generate-schema";
import { getConvexPath, padding } from "../src/generate-schema/utils";
import { expect, test } from "vitest";
import { format } from "prettier";

const CONVEX_TEST_DIR_PATH = getConvexPath("./test/test_convex");

test(`schema generation's padding to correctly indent`, () => {
	expect(padding("test")).toBe("  test");
	expect(padding(" test")).toBe("   test");
	expect(padding("test", 3)).toBe("   test");
	expect(padding("test", 0)).toBe("test");
	expect(padding("")).toBe("");
	expect(padding("", 3)).toBe("");
});

test("schema generation", async () => {
	const generate_schema = await generateSchema(
		[
			{
				schema: {
					testTable: {
						fields: {
							hello: {
								type: "boolean",
								required: false,
							},
							hello2: {
								type: "string",
								required: true,
							},
						},
					},
				},
				id: "test",
			},
		],
		{
			convex_dir_path: CONVEX_TEST_DIR_PATH,
		},
	);

	const hard_coded_schema = await format(
		[
			`import {defineSchema,defineTable} from "convex/server";`,
			`import {v} from "convex/values";`,
			``,
			`export default defineSchema({`,
			`messages: defineTable({`,
			`author: v.string(),`,
			`body: v.boolean(),`,
			`optional_body: v.optional(v.boolean()),`,
			`}),`,
			`testTable: defineTable({`,
			`hello: v.optional(v.boolean()),`,
			`hello2: v.string(),`,
			`say: v.string(),`,
			`say2: v.boolean(),`,
			`}),`,
			`});`,
		].join("\n"),
		{ filepath: "schema.ts" },
	);

	console.log(`\n\n\n--------------------------------- Generated:`);
	console.log(generate_schema);
	console.log(`--------------------------------- Hard-coded:`);
	console.log(hard_coded_schema);
	console.log(`---------------------------------\n\n\n`);

	expect(generate_schema).toBe(hard_coded_schema);
});
