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
  if (action === "update") return value;
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
