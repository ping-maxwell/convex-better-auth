import type { ActionBuilder, MutationBuilder, QueryBuilder, RegisteredAction, RegisteredMutation, RegisteredQuery } from "convex/server";
declare const q_: {
    eq: (key: string, value: any) => string;
    add: (key: string, value: any) => string;
    sub: (key: string, value: any) => string;
    mul: (key: string, value: any) => string;
    div: (key: string, value: any) => string;
    mod: (key: string, value: any) => string;
    neg: (key: string, value: any) => string;
    gt: (key: string, value: any) => string;
    lt: (key: string, value: any) => string;
    gte: (key: string, value: any) => string;
    lte: (key: string, value: any) => string;
    in: (key: string, value: any) => string;
    ne: (key: string, value: any) => string;
    and: (...args: any[]) => string;
    or: (...args: any[]) => string;
};
export declare function queryBuilder(cb: (q: typeof q_) => string): string;
export type ConvexReturnType = {
    betterAuth: RegisteredAction<"public", {
        action: string;
        value: any;
    }, Promise<any>>;
    query: RegisteredQuery<"internal", {
        tableName: string;
        query?: string;
        order?: "asc" | "desc";
        single?: boolean;
        limit?: number;
        offset?: number;
    }, Promise<any>>;
    insert: RegisteredMutation<"internal", {
        tableName: string;
        values: Record<string, any>;
    }, Promise<any>>;
    update: RegisteredMutation<"internal", {
        tableName: string;
        query: any;
        update: any;
    }, void>;
    delete_: RegisteredMutation<"internal", {
        tableName: string;
        query: any;
        deleteAll?: boolean;
    }, Promise<void>>;
};
export declare function ConvexHandler<Action extends ActionBuilder<any, "public"> = ActionBuilder<{}, "public">, Query extends QueryBuilder<any, "internal"> = QueryBuilder<{}, "internal">, Mutation extends MutationBuilder<any, "internal"> = MutationBuilder<{}, "internal">>({ action, internalQuery, internalMutation, internal, }: {
    action: Action;
    internalQuery: Query;
    internalMutation: Mutation;
    internal: {
        betterAuth: {
            query: any;
            insert: any;
            update: any;
            delete_: any;
        };
    } & Record<string, any>;
}): ConvexReturnType;
export {};
