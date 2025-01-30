import { v } from "convex/values";
import { stringToQuery } from "./helpers";
function replaceFields(key) {
    switch (key) {
        case "id":
            return "_id";
        case "createdAt":
            return "_creationTime";
        default:
            return key;
    }
}
const q_ = {
    eq: (key, value) => `q.eq(q.field("${replaceFields(key)}"), ${JSON.stringify(value)})`,
    add: (key, value) => `q.add(q.field("${replaceFields(key)}"), ${JSON.stringify(value)})`,
    sub: (key, value) => `q.sub(q.field("${replaceFields(key)}"), ${JSON.stringify(value)})`,
    mul: (key, value) => `q.mul(q.field("${replaceFields(key)}"), ${JSON.stringify(value)})`,
    div: (key, value) => `q.div(q.field("${replaceFields(key)}"), ${JSON.stringify(value)})`,
    mod: (key, value) => `q.mod(q.field("${replaceFields(key)}"), ${JSON.stringify(value)})`,
    neg: (key, value) => `q.neg(q.field("${replaceFields(key)}"), ${JSON.stringify(value)})`,
    gt: (key, value) => `q.gt(q.field("${replaceFields(key)}"), ${JSON.stringify(value)})`,
    lt: (key, value) => `q.lt(q.field("${replaceFields(key)}"), ${JSON.stringify(value)})`,
    gte: (key, value) => `q.gte(q.field("${replaceFields(key)}"), ${JSON.stringify(value)})`,
    lte: (key, value) => `q.lte(q.field("${replaceFields(key)}"), ${JSON.stringify(value)})`,
    in: (key, value) => `q.in(q.field("${replaceFields(key)}"), ${JSON.stringify(value)})`,
    ne: (key, value) => `q.neq(q.field("${replaceFields(key)}"), ${JSON.stringify(value)})`,
    and: (...args) => `q.and(${args.join(", ")})`,
    or: (...args) => `q.or(${args.join(", ")})`,
};
export function queryBuilder(cb) {
    return cb(q_);
}
export function ConvexHandler({ action, internalQuery, internalMutation, internal, }) {
    const betterAuth = action({
        args: { action: v.string(), value: v.any() },
        handler: async (ctx, args) => {
            if (args.action === "query") {
                // console.log(`Query:`, args.value);
                const data = (await ctx.runQuery(internal.betterAuth.query, {
                    query: args.value.query,
                    tableName: args.value.tableName,
                    limit: args.value.limit,
                    offset: args.value.offset,
                    order: args.value.order,
                    single: args.value.single,
                    paginationOpts: args.value.paginationOpts,
                }));
                return data;
            }
            if (args.action === "insert") {
                try {
                    const _id = await ctx.runMutation(internal.betterAuth.insert, {
                        tableName: args.value.tableName,
                        values: args.value.values,
                    });
                    return {
                        _id: _id,
                        ...args.value.values,
                    };
                }
                catch (error) {
                    return error;
                }
            }
            if (args.action === "update") {
                const res = await ctx.runMutation(internal.betterAuth.update, {
                    tableName: args.value.tableName,
                    query: args.value.query,
                    update: args.value.update,
                });
                return res;
            }
            if (args.action === "delete") {
                const res = await ctx.runMutation(internal.betterAuth.delete_, {
                    tableName: args.value.tableName,
                    query: args.value.query,
                    deleteAll: args.value.deleteAll,
                });
                return res;
            }
        },
    });
    const query = internalQuery({
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
            limit: v.optional(v.number()),
            paginationOpts: v.optional(v.object({
                numItems: v.optional(v.number()),
                cursor: v.optional(v.string()),
            })),
        },
        //@ts-ignore
        handler: async (ctx, args) => {
            let query = ctx.db.query(args.tableName).order(args.order || "asc");
            if (args.query) {
                query = query.filter((q) => {
                    return stringToQuery(args.query, q);
                });
            }
            if (args.paginationOpts) {
                return await query.paginate(args.paginationOpts);
            }
            if (args.single === true) {
                return await query.first();
            }
            if (typeof args.limit === "number") {
                return await query.take(args.limit);
            }
            return await query.collect();
        },
    });
    const insert = internalMutation({
        args: {
            tableName: v.string(),
            values: v.any(),
        },
        handler: async (ctx, args) => {
            return await ctx.db.insert(args.tableName, args.values);
        },
    });
    const update = internalMutation({
        args: {
            tableName: v.string(),
            query: v.any(),
            update: v.any(),
        },
        async handler(ctx, { tableName, update, query }) {
            const res = await ctx.db
                .query(tableName)
                .filter((q) => {
                return stringToQuery(query, q);
            })
                .first();
            //If no result found for that query, than there is no mutation needed.
            if (!res)
                return;
            await ctx.db.patch(res._id, update);
            return Object.assign(res, update);
        },
    });
    const delete_ = internalMutation({
        args: {
            tableName: v.string(),
            query: v.any(),
            deleteAll: v.optional(v.boolean()),
        },
        async handler(ctx, { tableName, query, deleteAll }) {
            const r = ctx.db.query(tableName).filter((q) => {
                return stringToQuery(query, q);
            });
            if (!deleteAll) {
                const res = await r.first();
                //If no result found for that query, than there is no mutation needed.
                if (!res)
                    return;
                await ctx.db.delete(res._id);
                return;
            }
            const res = await r.collect();
            if (!res)
                return;
            res.forEach((r) => {
                ctx.db.delete(r._id);
            });
            return;
        },
    });
    return { betterAuth, query, insert, update, delete_ };
}
