import { generateSchema } from "../src/generate-schema";
import { getConvexPath, padding } from "../src/generate-schema/utils";
import { expect, test } from "vitest";
import { format } from "prettier";

const CONVEX_TEST_DIR_PATH = getConvexPath("./test/test_convex");

console.log(`CONVEX_TEST_DIR_PATH: ${CONVEX_TEST_DIR_PATH}`);

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
			`testTable: defineTable({`,
			`hello: v.boolean(),`,
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
