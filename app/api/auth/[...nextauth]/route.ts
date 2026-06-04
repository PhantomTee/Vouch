import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.login = (profile as { login: string }).login;
        token.githubUrl = (profile as { html_url: string }).html_url;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { login: string; githubUrl: string }).login = token.login as string;
        (session.user as typeof session.user & { login: string; githubUrl: string }).githubUrl = token.githubUrl as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
