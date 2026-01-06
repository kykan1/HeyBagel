import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getDb } from "@/lib/db/client";

// Custom adapter that uses our existing postgres connection
const adapter = {
  async createUser(user: any) {
    const sql = getDb();
    const id = crypto.randomUUID();
    await sql`
      INSERT INTO users (id, email, name, image, email_verified)
      VALUES (
        ${id}, 
        ${user.email}, 
        ${user.name ?? null}, 
        ${user.image ?? null}, 
        ${user.emailVerified ? new Date(user.emailVerified) : null}
      )
    `;
    return { ...user, id };
  },
  
  async getUser(id: string) {
    const sql = getDb();
    const users = await sql`SELECT * FROM users WHERE id = ${id}`;
    return users[0] || null;
  },
  
  async getUserByEmail(email: string) {
    const sql = getDb();
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    return users[0] || null;
  },
  
  async getUserByAccount({ providerAccountId, provider }: any) {
    const sql = getDb();
    const accounts = await sql`
      SELECT u.* FROM users u
      JOIN accounts a ON u.id = a.user_id
      WHERE a.provider_account_id = ${providerAccountId}
      AND a.provider = ${provider}
    `;
    return accounts[0] || null;
  },
  
  async updateUser(user: any) {
    const sql = getDb();
    await sql`
      UPDATE users
      SET 
        email = ${user.email}, 
        name = ${user.name ?? null}, 
        image = ${user.image ?? null}, 
        email_verified = ${user.emailVerified ? new Date(user.emailVerified) : null}, 
        updated_at = NOW()
      WHERE id = ${user.id}
    `;
    const users = await sql`SELECT * FROM users WHERE id = ${user.id}`;
    return users[0];
  },
  
  async linkAccount(account: any) {
    const sql = getDb();
    const id = crypto.randomUUID();
    await sql`
      INSERT INTO accounts (
        id, user_id, type, provider, provider_account_id,
        refresh_token, access_token, expires_at, token_type, scope, id_token
      ) VALUES (
        ${id}, 
        ${account.userId}, 
        ${account.type}, 
        ${account.provider},
        ${account.providerAccountId}, 
        ${account.refresh_token ?? null}, 
        ${account.access_token ?? null},
        ${account.expires_at ?? null}, 
        ${account.token_type ?? null}, 
        ${account.scope ?? null}, 
        ${account.id_token ?? null}
      )
    `;
    return account;
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: adapter as any,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user ID to JWT token on sign-in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      // Add user ID from JWT to session
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
});