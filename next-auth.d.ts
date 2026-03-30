import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      age?: number | null;
      contact_number?: string | null;
    };
  }

  interface User {
    id: string;
    age?: number | null;
    contact_number?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    age?: number | null;
    contact_number?: string | null;
    profile?: string | null;
  }
}