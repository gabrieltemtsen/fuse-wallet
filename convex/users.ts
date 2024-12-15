import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
/**
 * Insert or update the user in a Convex table then return the document's ID.
 *
 * The `UserIdentity.tokenIdentifier` string is a stable and unique value we use
 * to look up identities.
 *
 * Keep in mind that `UserIdentity` has a number of optional fields, the
 * presence of which depends on the identity provider chosen. It's up to the
 * application developer to determine which ones are available and to decide
 * which of those need to be persisted. For Clerk the fields are determined
 * by the JWT token's Claims config.
 */
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if we've already stored this identity before.
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (user !== null) {
      // If we've seen this identity before but the name has changed, patch the value.
      if (user.name !== identity.name) {
        await ctx.db.patch(user._id, { name: identity.name });
      }
      return user;
    }
    // If it's a new identity, create a new `User`.
    return await ctx.db.insert("users", {
      name: identity.name!,
      tokenIdentifier: identity.tokenIdentifier,
    });
  },
});
/**
 * Set the `isPinSet` value of a user to true.
 *
 * @param userId - The ID of the user.
 */

export const updateSubOrgId = mutation({
  args: { id: v.id("users"), suborgId: v.string() },
  handler: async (ctx, args) => {
    const { id, suborgId } = args;
    console.log(await ctx.db.get(id));
    // { text: "foo", status: { done: true }, _id: ... }

    // Add `tag` and overwrite `status`:
    await ctx.db.patch(id, { suborgId });

    console.log(await ctx.db.get(id));
    return true;
   
  },
});
/**
 * Retrieve the user information by ID.
 *
 * @param userId - The ID of the user.
 * @returns The user information.
 */
export const getUser = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
   if(args.userId){
      const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), args.userId))
      .unique();
      return user;
   } else {
       return null;
   }
  

  },
});