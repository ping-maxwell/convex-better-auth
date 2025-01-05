import { betterAuth } from "better-auth";
import { convexAdapter } from "./../src";
import { query } from "../convex/_generated/server";
import { v } from "convex/values";

const auth = betterAuth({
	database: convexAdapter(query),
});

const listTasks = query({
	handler: async (ctx) => {
		const tasks = await ctx.db.query("tasks").collect();
		// do something with `tasks`
	},
});
