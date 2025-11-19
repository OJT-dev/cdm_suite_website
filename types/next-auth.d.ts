
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    tier: string;
    subscriptionStatus: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      tier: string;
      subscriptionStatus: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    tier: string;
    subscriptionStatus: string;
    role: string;
  }
}
