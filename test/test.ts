import { betterAuth } from "better-auth";
import { convexAdapter } from "./../src";
import { query, mutation } from "../convex/_generated/server";

export const auth = betterAuth({
	database: convexAdapter({ mutation, query }),
	plugins: [],
	//... other options
});
