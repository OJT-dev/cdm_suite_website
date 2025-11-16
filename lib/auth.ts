
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        // Automatically upgrade @cdmsuite.com emails to employee if not already
        const shouldBeEmployee = user.email.endsWith('@cdmsuite.com') && user.role === 'client';
        
        // Update last login and role if needed
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            lastLoginAt: new Date(),
            ...(shouldBeEmployee && { role: 'employee' }),
          },
        });

        // Update role in the user object if changed
        const finalRole = shouldBeEmployee ? 'employee' : user.role;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          tier: user.tier,
          subscriptionStatus: user.subscriptionStatus,
          role: finalRole,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.tier = user.tier;
        token.subscriptionStatus = user.subscriptionStatus;
        token.role = user.role;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token = { ...token, ...session.user };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.tier = token.tier as string;
        session.user.subscriptionStatus = token.subscriptionStatus as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
