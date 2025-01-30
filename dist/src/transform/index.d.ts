import type { ConvexAdapterOptions } from "../types";
import type { BetterAuthOptions, Where } from "better-auth";
import type { ConvexClient } from "convex/browser";
export declare const createTransform: ({ config, options, client, }: {
    config: ConvexAdapterOptions;
    options: BetterAuthOptions;
    client: ConvexClient;
}) => {
    transformInput(data: Record<string, any>, model: string, action: "create" | "update"): Record<string, any>;
    transformOutput(data: Record<string, any>, model: string): Record<string, any>;
    getModelName: (model: string) => string;
    db: (options: {
        action: "insert";
        tableName: string;
        values: Record<string, any>;
    } | {
        action: "query";
        tableName: string;
        query?: string;
        order?: "asc" | "desc";
        single?: boolean;
        limit?: number;
        paginationOpts?: {
            numItems: number;
            cursor?: string;
        };
    } | {
        action: "delete";
        tableName: string;
        query: string;
        deleteAll?: boolean;
    } | {
        action: "update";
        tableName: string;
        query: string;
        update: Record<string, any>;
    }) => Promise<any>;
    filterInvalidOperators: (where: Where[] | undefined) => void;
    transformWhereOperators: (where: Where[] | undefined) => Where[];
};
