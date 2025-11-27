import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { createAuthMiddleware } from "better-auth/api";


const client = new MongoClient(process.env.MONGO_URI as string);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 // 1 day (every 1 day the session expiration is updated)
},

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "patient",
        input: false,
      },
    },
  },

  socialProviders: {
    google: {
      prompt: "select_account",
      clientId:process.env.GOOGLE_CLIENT_ID as string,
      clientSecret:process.env.GOOGLE_CLIENT_SECRET as string
    },
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const email =
        ctx.context.newSession?.user.email || ctx.body?.email || null;

      if (!email) return;

      const users = db.collection("user");
      const user = await users.findOne({email});

      if (!user) return;

      if (!user.role) {
        await users.updateOne({ _id: user._id }, { $set: { role: "patient" } });
      }
    }),
  },
});
