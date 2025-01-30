import type { BetterAuthPlugin } from "better-auth";
export declare const generateSchemaBuilderStage: ({ code, plugins, }: {
    code: string;
    plugins: BetterAuthPlugin[];
}) => Promise<string>;
