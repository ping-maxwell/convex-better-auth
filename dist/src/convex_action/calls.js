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
