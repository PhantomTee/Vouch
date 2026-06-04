import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      login: string;
      githubUrl: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    login: string;
    githubUrl: string;
  }
}
