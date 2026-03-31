import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Dynamic imports to avoid Edge runtime issues
        const { default: prisma } = await import("@/lib/prisma");
        const bcrypt = await import("bcryptjs");

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
          image: user.avatarUrl,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      // For Google OAuth, find or create user
      if (account?.provider === "google" && user?.email) {
        const { default: prisma } = await import("@/lib/prisma");
        const existing = await prisma.user.findUnique({ where: { email: user.email } });
        if (existing) {
          token.id = existing.id;
        } else {
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              firstName: user.name?.split(" ")[0] || "",
              lastName: user.name?.split(" ").slice(1).join(" ") || "",
              avatarUrl: user.image || undefined,
              role: "CANDIDATE",
            },
          });
          token.id = newUser.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
