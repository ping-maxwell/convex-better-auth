import type { BetterAuthPlugin } from "better-auth";
export declare const generateSchema: (plugins: BetterAuthPlugin[], options?: {
    convex_dir_path: string;
}) => Promise<string>;
