import type { FilterBuilder } from "convex/server";
import type { Expression } from "convex/server";

//@ts-ignore
export type QueryFilter = (q: FilterBuilder<{}>) => Expression<boolean>;
//@ts-ignore
export function stringToQuery(query_string: string, query: FilterBuilder<{}>) {
  const tokens = tokenize(query_string);
  return parseExpression(tokens, { value: 0 }, query);
}

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
        if (!Number.isNaN(Number(current.trim()))) {
          tokens.push({ type: "number", value: current.trim() });
        } else {
          tokens.push({ type: "function", value: current.trim() });
        }
        current = "";
      }
      tokens.push({ type: "parenthesis", value: char });
    } else if (char === ",") {
      if (current) {
        if (!Number.isNaN(Number(current.trim()))) {
          tokens.push({ type: "number", value: current.trim() });
        } else {
          tokens.push({ type: "function", value: current.trim() });
        }
        current = "";
      }
      tokens.push({ type: "comma", value: "," });
    } else if (char === " ") {
      if (current) {
        if (!Number.isNaN(Number(current.trim()))) {
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
    if (!Number.isNaN(Number(current.trim()))) {
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
  query: FilterBuilder<{}>,
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
