import { generateId } from "better-auth";
import { getAuthTables, type FieldAttribute } from "better-auth/db";
import type { ConvexAdapterOptions } from "../types";
import type { BetterAuthOptions, Where } from "better-auth";
import type { ConvexClient } from "convex/browser";
import { anyApi } from "convex/server";

export function queryDb(
  client: ConvexClient,
  args: {
    tableName: string;
    query?: string;
    order?: "asc" | "desc";
    single?: boolean;
  }
) {
  return client.action(anyApi.betterAuth.betterAuth, {
    action: "query",
    value: args,
  });
}

export const createTransform = ({
  config,
  options,
  client,
}: {
  config: ConvexAdapterOptions;
  options: BetterAuthOptions;
  client: ConvexClient;
}) => {
  const schema = getAuthTables(options);

  function getField(model: string, field: string) {
    if (field === "id") {
      return field;
    }
    const f = schema[model].fields[field];
    return f.fieldName || field;
  }

  function db(action: "insert" | "read" | "update" | "delete") {
    if (action === "read") {
      return queryDb(client, {
        tableName: "users",
      });
    }
    return "";
  }

  const getModelName = (model: string) => {
    return schema[model].modelName !== model ? schema[model].modelName : model;
  };

  const useDatabaseGeneratedId = options?.advanced?.generateId === false;
  return {
    transformInput(
      data: Record<string, any>,
      model: string,
      action: "create" | "update"
    ) {
      const transformedData: Record<string, any> =
        useDatabaseGeneratedId || action === "update"
          ? {}
          : {
              id: options.advanced?.generateId
                ? options.advanced.generateId({
                    model,
                  })
                : data.id || generateId(),
            };
      const fields = schema[model].fields;
      for (const field in fields) {
        const value = data[field];
        if (value === undefined && !fields[field].defaultValue) {
          continue;
        }
        transformedData[fields[field].fieldName || field] = withApplyDefault(
          value,
          fields[field],
          action
        );
      }
      return transformedData;
    },
    convertWhereClause(where: Where[], model: string) {
      // const schemaModel = getSchema(model);
      // if (!where) return [];
      // if (where.length === 1) {
      // 	const w = where[0];
      // 	if (!w) {
      // 		return [];
      // 	}
      // 	const field = getField(model, w.field);
      // 	if (!schemaModel[field]) {
      // 		throw new BetterAuthError(
      // 			`The field "${w.field}" does not exist in the schema for the model "${model}". Please update your schema.`,
      // 		);
      // 	}
      // 	if (w.operator === "in") {
      // 		if (!Array.isArray(w.value)) {
      // 			throw new BetterAuthError(
      // 				`The value for the field "${w.field}" must be an array when using the "in" operator.`,
      // 			);
      // 		}
      // 		return [inArray(schemaModel[field], w.value)];
      // 	}
      // 	if (w.operator === "contains") {
      // 		return [like(schemaModel[field], `%${w.value}%`)];
      // 	}
      // 	if (w.operator === "starts_with") {
      // 		return [like(schemaModel[field], `${w.value}%`)];
      // 	}
      // 	if (w.operator === "ends_with") {
      // 		return [like(schemaModel[field], `%${w.value}`)];
      // 	}
      // 	return [eq(schemaModel[field], w.value)];
      // }
      // const andGroup = where.filter(
      // 	(w) => w.connector === "AND" || !w.connector,
      // );
      // const orGroup = where.filter((w) => w.connector === "OR");
      // const andClause = and(
      // 	...andGroup.map((w) => {
      // 		const field = getField(model, w.field);
      // 		if (w.operator === "in") {
      // 			if (!Array.isArray(w.value)) {
      // 				throw new BetterAuthError(
      // 					`The value for the field "${w.field}" must be an array when using the "in" operator.`,
      // 				);
      // 			}
      // 			return inArray(schemaModel[field], w.value);
      // 		}
      // 		return eq(schemaModel[field], w.value);
      // 	}),
      // );
      // const orClause = or(
      // 	...orGroup.map((w) => {
      // 		const field = getField(model, w.field);
      // 		return eq(schemaModel[field], w.value);
      // 	}),
      // );
      // const clause: SQL<unknown>[] = [];
      // if (andGroup.length) clause.push(andClause!);
      // if (orGroup.length) clause.push(orClause!);
      // return clause;
    },
    getField,
    getModelName,
    db,
  };
};

function withApplyDefault(
  value: any,
  field: FieldAttribute,
  action: "create" | "update"
) {
  if (action === "update") {
    return value;
  }
  if (value === undefined || value === null) {
    if (field.defaultValue) {
      if (typeof field.defaultValue === "function") {
        return field.defaultValue();
      }
      return field.defaultValue;
    }
  }
  return value;
}
