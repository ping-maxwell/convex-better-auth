import type { ConvexClient } from "convex/browser";
export declare function queryDb(client: ConvexClient, args: {
    tableName: string;
    query?: string;
    order?: "asc" | "desc";
    single?: boolean;
    limit?: number;
    paginationOpts?: {
        numItems: number;
        cursor?: string;
    };
}): Promise<any>;
export declare function insertDb(client: ConvexClient, args: {
    tableName: string;
    values: Record<string, any>;
}): Promise<any>;
export declare function updateDb(client: ConvexClient, args: {
    tableName: string;
    query: string;
    update: Record<string, any>;
}): Promise<any>;
export declare function deleteDb(client: ConvexClient, args: {
    tableName: string;
    query: string;
    deleteAll?: boolean;
}): Promise<any>;
