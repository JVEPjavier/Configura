import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/lib/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true },
  plugins: [nextCookies()],
  databaseHooks: {
    user: {
      create: {
        after: async (newUser) => {
          const suffix = newUser.id.slice(0, 8);
          await db.insert(schema.stores).values({
            id: crypto.randomUUID(),
            ownerId: newUser.id,
            name: "Mi tienda",
            slug: `mi-tienda-${suffix}`,
          });
        },
      },
    },
  },
});
