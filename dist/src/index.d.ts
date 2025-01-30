import type { AdapterInstance } from "better-auth";
import type { ConvexAdapterOptions } from "./types";
export * from "./convex_action/index";
export type ConvexAdapter = (config: ConvexAdapterOptions) => AdapterInstance;
export declare const convexAdapter: ConvexAdapter;
