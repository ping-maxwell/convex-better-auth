import { doesHaveRequiredImports } from "./utils";

const imports = [
	`import { defineSchema, defineTable } from "convex/server";`,
	`import { v } from "convex/values";`,
].join("\n");

export const generateImportStage = (existing_schema_code: string) => {
	const has_imports = doesHaveRequiredImports(existing_schema_code);

	if (has_imports) return existing_schema_code;

	return `${imports}\n${existing_schema_code}`;
};
