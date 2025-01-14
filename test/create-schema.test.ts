import { generateSchema } from "../src/generate-schema";
import { getConvexPath } from "../src/generate-schema/utils";
import { describe, expect, it } from "vitest";
import { format } from "prettier";

const CONVEX_TEST_DIR_PATH = getConvexPath("./test/test_convex1");
const CONVEX_TEST_DIR_PATH2 = getConvexPath("./test/test_convex2");
const CONVEX_TEST_DIR_PATH3 = getConvexPath("./test/test_convex3");

describe(`Handle schema generation`, async () => {
	it("should generate the correct schema with existing schema", async () => {
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

	// `name: v.string(),`,
	// `id: v.id(),`,
	// `isAdmin: v.boolean(),`,
	// `status: v.optional(v.string()),`,
	it("should generate the correct schema based on multiple plugins", async () => {
		const generate_schema = await generateSchema(
			[
				{
					schema: {
						user: {
							fields: {},
						},
						admins: {
							fields: {},
						},
					},
					id: "test",
				},
			],
			{
				convex_dir_path: CONVEX_TEST_DIR_PATH2,
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
				`user: defineTable({`,
				`}),`,
				`admins: defineTable({`,
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

	it(`should generate the correct schema based on multiple different field types`, async () => {
		const generate_schema = await generateSchema(
			[
				{
					id: "admin",
					schema: {
						admin: {
							fields: {
								name: {
									type: "string",
									required: true,
								},
								id: {
									type: "string",
									required: true,
								},
								isAdmin: {
									type: "boolean",
									required: true,
								},
								status: {
									type: "string",
									required: false,
								},
								date: {
									type: "date",
								},
								number: {
									type: "number",
								},
								str_array: {
									type: "string[]",
								},
								num_array: {
									type: "number[]",
								},
							},
						},
					},
				},
			],
			{
				convex_dir_path: CONVEX_TEST_DIR_PATH3,
			},
		);

		const hard_coded_schema = await format(
			[
				`import {defineSchema,defineTable} from "convex/server";`,
				`import {v} from "convex/values";`,
				``,
				`export default defineSchema({`,
				`admin: defineTable({`,
				`name: v.string(),`,
				`id: v.id("admin"),`,
				`isAdmin: v.boolean(),`,
				`status: v.optional(v.string()),`,
				`date: v.optional(v.string()),`,
				`number: v.optional(v.number()),`,
				`str_array: v.optional(v.array()),`,
				`num_array: v.optional(v.array()),`,
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

	it(`should generate references correctly`, async () => {
		const generate_schema = await generateSchema(
			[
				{
					id: "admin",
					schema: {
						admin: {
							fields: {
								id: {
									type: "string",
									required: true,
								},
								reference_optional: {
									type: "string",
									references: {
										field: "something",
										model: "something_else",
									},
								},
								reference_required: {
									type: "string",
									required: true,
									references: {
										field: "something2",
										model: "something2_else",
									},
								},
							},
						},
					},
				},
			],
			{
				convex_dir_path: CONVEX_TEST_DIR_PATH3,
			},
		);

		const hard_coded_schema = await format(
			[
				`import {defineSchema,defineTable} from "convex/server";`,
				`import {v} from "convex/values";`,
				``,
				`export default defineSchema({`,
				`admin: defineTable({`,
				`id: v.id("admin"),`,
				`reference_optional: v.id("something_else"),`,
				`reference_required: v.id("something2_else"),`,
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

	


	it("should should support .index method after `defineTable`", async () => {
		const generate_schema = await generateSchema(
			[
				{
					schema: {
						testTable: {
							fields: {
								
							},
						},
					},
					id: "test",
				},
			],
			{
				convex_dir_path: CONVEX_TEST_DIR_PATH3,
			},
		);

		const hard_coded_schema = await format(
			[
				`import {defineSchema,defineTable} from "convex/server";`,
				`import {v} from "convex/values";`,
				``,
				`export default defineSchema({`,
				`testTable: defineTable({`,
				`}).index("by_something", ["email"]),`,
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
});
