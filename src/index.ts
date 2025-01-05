import type { Adapter } from "better-auth";
import type { DB } from "./types";

export const convexAdapter = (db: DB): Adapter => {
	return {
		id: "convex",
	};
};
