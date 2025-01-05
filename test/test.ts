import { betterAuth } from "better-auth";
import { convexAdapter } from "./../src";
import { query } from "../convex/_generated/server";

const auth = betterAuth({
	database: convexAdapter(query),
});
