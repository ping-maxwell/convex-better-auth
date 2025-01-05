import { generateSchema, padding } from "../src/generate-schema";
import { expect, test } from "vitest";

test(`schema generation's padding to correctly indent`, () => {
	expect(padding("test")).toBe("  test");
	expect(padding(" test")).toBe("   test");
	expect(padding("test", 3)).toBe("   test");
	expect(padding("test", 0)).toBe("test");
	expect(padding("")).toBe("");
	expect(padding("", 3)).toBe("");
});

test("schema generation", () => {
	const generate_schema = generateSchema([
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
	]);

	const hard_coded_schema = [
		`import { defineSchema, defineTable } from "convex/server";`,
		`import { v } from "convex/values";`,
		``,
		`export default defineSchema({`,
		padding(`testTable: defineTable({`),
		padding(padding(`hello: v.boolean(),`)),
		padding(`}),`),
		`});`,
	].join("\n");

	console.log(`\n\n\n--------------------------------- Generated:`);
	console.log(generate_schema);
	console.log(`--------------------------------- Hard-coded:`);
	console.log(hard_coded_schema);
	console.log(`---------------------------------\n\n\n`);

	expect(generate_schema).toBe(hard_coded_schema);
});
