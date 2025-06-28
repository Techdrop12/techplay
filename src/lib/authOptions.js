// ✅ /src/lib/authOptions.js (NextAuth, sécurisé, full option)
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import dbConnect from './dbConnect';

export const authOptions = {
  providers: [
    Providers.Email({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    // Ajoute ici d’autres providers (Google, Github…) si besoin
  ],
  callbacks: {
    async session({ session, token }) {
      session.userId = token.sub;
      return session;
    },
    async signIn({ user }) {
      await dbConnect();
      // Optionnel : vérifie si user a le rôle admin dans la base…
      return true;
    }
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};
