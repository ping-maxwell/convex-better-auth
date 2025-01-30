import { generateId } from "better-auth";
import { getAuthTables } from "better-auth/db";
import { anyApi } from "convex/server";
export async function queryDb(client, args) {
    return await client.action(anyApi.betterAuth.betterAuth, {
        action: "query",
        value: args,
    });
}
export async function insertDb(client, args) {
    const call = await client.action(anyApi.betterAuth.betterAuth, {
        action: "insert",
        value: args,
    });
    return call;
}
export async function updateDb(client, args) {
    const call = await client.action(anyApi.betterAuth.betterAuth, {
        action: "update",
        value: args,
    });
    return call;
}
export async function deleteDb(client, args) {
    const call = await client.action(anyApi.betterAuth.betterAuth, {
        action: "delete",
        value: args,
    });
    return call;
}
export const createTransform = ({ config, options, client, }) => {
    const schema = getAuthTables(options);
    function transformWhereOperators(where) {
        if (!where)
            return [];
        const new_where = [];
        for (const w of where) {
            if (w.operator === "in") {
                w.value.forEach((v, i) => {
                    new_where.push({
                        field: w.field,
                        value: v,
                        operator: "eq",
                        connector: i < w.value.length - 1 ? "OR" : undefined,
                    });
                });
            }
            else {
                new_where.push(w);
            }
        }
        return new_where;
    }
    function getField(model, field) {
        if (field === "id") {
            return field;
        }
        const f = schema[model].fields[field];
        return f.fieldName || field;
    }
    async function db(options) {
        if (options.action === "query") {
            return await queryDb(client, {
                tableName: options.tableName,
                order: options.order,
                query: options.query,
                single: options.single,
                limit: options.limit,
                paginationOpts: options.paginationOpts,
            });
        }
        if (options.action === "insert") {
            return await insertDb(client, {
                tableName: options.tableName,
                values: options.values,
            });
        }
        if (options.action === "delete") {
            return await deleteDb(client, {
                tableName: options.tableName,
                query: options.query,
                deleteAll: options.deleteAll,
            });
        }
        if (options.action === "update") {
            return await updateDb(client, {
                tableName: options.tableName,
                query: options.query,
                update: options.update,
            });
        }
        return "";
    }
    const getModelName = (model) => {
        return schema[model].modelName !== model ? schema[model].modelName : model;
    };
    function filterInvalidOperators(where) {
        if (!where)
            return;
        const invalidOps = ["contains", "starts_with", "ends_with"];
        if (where.filter((w) => invalidOps.includes(w.operator || "")).length > 0) {
            throw new Error(`Convex does not support ${invalidOps.join(", ")} operators`);
        }
    }
    const useDatabaseGeneratedId = options?.advanced?.generateId === false;
    return {
        transformInput(data, model, action) {
            const transformedData = useDatabaseGeneratedId || action === "update"
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
                transformedData[fields[field].fieldName || field] = withApplyDefault(value, fields[field], action);
            }
            for (const field in transformedData) {
                if (field === "id") {
                    delete transformedData[field];
                }
                else if (field === "createdAt") {
                    delete transformedData[field];
                }
                else if (transformedData[field] instanceof Date) {
                    transformedData[field] = transformedData[field].toISOString();
                }
            }
            return transformedData;
        },
        transformOutput(data) {
            for (const field in data) {
                if (field === "_id") {
                    data.id = data[field];
                    delete data[field];
                }
                else if (field === "_creationTime") {
                    data.createdAt = data[field];
                    delete data[field];
                }
            }
            return data;
        },
        getField,
        getModelName,
        db,
        filterInvalidOperators,
        transformWhereOperators,
    };
};
function withApplyDefault(value, field, action) {
    if (action === "update")
        return value;
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
