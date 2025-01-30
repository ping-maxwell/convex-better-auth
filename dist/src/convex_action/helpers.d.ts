import type { FilterBuilder } from "convex/server";
import type { Expression } from "convex/server";
export type QueryFilter = (q: FilterBuilder<{}>) => Expression<boolean>;
export declare function stringToQuery(query_string: string, query: FilterBuilder<{}>): any;
type Token = {
    type: "function" | "string" | "number" | "parenthesis" | "comma" | "bracket";
    value: string;
};
export declare function tokenize(query_string: string): Token[];
export {};
