import {
  action,
  internalAction,
  internalQuery,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Expression, FilterBuilder } from "convex/server";

export const betterAuth = action({
  args: { action: v.string(), value: v.any() },
  handler: async (ctx, args) => {
    if (args.action === "query") {
      const data = (await ctx.runQuery(internal.betterAuth._BA_readData, {
        query: args.value.query,
        tableName: args.value.tableName,
      })) as unknown as any;
      return data;
    }
  },
});

export const _BA_readData = internalQuery({
  args: {
    tableName: v.string(),
    query: v.optional(v.any()),
    /**
     * asc or desc
     */
    order: v.optional(v.string()),
    /**
     * Only get the first.
     */
    single: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    args: {
      tableName: string;
      query?: string;
      order?: "asc" | "desc";
      single?: boolean;
    }
  ) => {
    const query = ctx.db
      //@ts-ignore
      .query(args.tableName)
      .order(args.order || "asc")
      //@ts-ignore
      .filter((q) => {
        if (!args.query) return true;
        return stringToQuery(args.query, q);
      });

    if (args.single) return await query.first();
    return await query.collect();
  },
});

//@ts-ignore
export type QueryFilter = (q: FilterBuilder<{}>) => Expression<boolean>;

export function queryBuilder(cb: QueryFilter) {
  return cb.toString().replace("(q) => ", "");
}

//@ts-ignore
function stringToQuery(query_string: string, query: FilterBuilder<{}>) {
  const tokens = tokenize(query_string);
  return parseExpression(tokens, { value: 0 }, query);
}

///=============================================================================

type Token = {
  type: "function" | "string" | "number" | "parenthesis" | "comma";
  value: string;
};
function tokenize(query_string: string): Token[] {
  const tokens: Token[] = [];
  let current = "";
  let inString = false;

  for (let i = 0; i < query_string.length; i++) {
    const char = query_string[i];

    if (char === '"' && query_string[i - 1] !== "\\") {
      if (inString) {
        tokens.push({ type: "string", value: current });
        current = "";
      }
      inString = !inString;
      continue;
    }

    if (inString) {
      current += char;
      continue;
    }

    if (char === "(" || char === ")") {
      if (current) {
        // Check if the current token is a number
        if (!isNaN(Number(current.trim()))) {
          tokens.push({ type: "number", value: current.trim() });
        } else {
          tokens.push({ type: "function", value: current.trim() });
        }
        current = "";
      }
      tokens.push({ type: "parenthesis", value: char });
    } else if (char === ",") {
      if (current) {
        if (!isNaN(Number(current.trim()))) {
          tokens.push({ type: "number", value: current.trim() });
        } else {
          tokens.push({ type: "function", value: current.trim() });
        }
        current = "";
      }
      tokens.push({ type: "comma", value: "," });
    } else if (char === " ") {
      if (current) {
        if (!isNaN(Number(current.trim()))) {
          tokens.push({ type: "number", value: current.trim() });
        } else {
          tokens.push({ type: "function", value: current.trim() });
        }
        current = "";
      }
    } else {
      current += char;
    }
  }

  if (current) {
    if (!isNaN(Number(current.trim()))) {
      tokens.push({ type: "number", value: current.trim() });
    } else {
      tokens.push({ type: "function", value: current.trim() });
    }
  }

  return tokens;
}

function parseExpression(
  tokens: Token[],
  index: { value: number },
  //@ts-ignore
  query: FilterBuilder<{}>
): any {
  if (index.value >= tokens.length) {
    throw new Error("Unexpected end of input");
  }

  const token = tokens[index.value];
  index.value++;

  if (token.type === "function") {
    if (token.value.startsWith("q.")) {
      const functionName = token.value.slice(2);

      // Expect opening parenthesis
      if (
        tokens[index.value]?.type !== "parenthesis" ||
        tokens[index.value]?.value !== "("
      ) {
        throw new Error("Expected opening parenthesis");
      }
      index.value++;

      const args: any[] = [];
      while (
        index.value < tokens.length &&
        tokens[index.value].type !== "parenthesis"
      ) {
        if (tokens[index.value].type === "comma") {
          index.value++;
          continue;
        }
        args.push(parseExpression(tokens, index, query));
      }

      // Expect closing parenthesis
      if (tokens[index.value]?.value !== ")") {
        throw new Error("Expected closing parenthesis");
      }
      index.value++;

      // @ts-ignore
      return query[functionName](...args);
    }
  } else if (token.type === "string") {
    return token.value;
  } else if (token.type === "number") {
    return Number(token.value);
  }

  throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
}
