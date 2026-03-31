import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs"; // Sigurohu që është saktësisht 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Kredencialet",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Fjalëkalimi", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // 1. Pastrojmë emailin dhe e bëjmë me shkronja të vogla (për siguri)
        const emailTrimmed = credentials.email.trim().toLowerCase();
        const passwordTrimmed = credentials.password.trim();

        // 2. Gjejmë përdoruesin
        const user = await prisma.users.findUnique({
          where: { email: emailTrimmed }
        });

        // DEBUG: Shih në terminalin e VS Code nëse po e gjen përdoruesin
        if (!user) {
          console.log("❌ LOGIN FAIL: Përdoruesi nuk u gjet me emailin:", emailTrimmed);
          return null;
        }

        if (!user.password) return null;

        // 3. Krahasojmë fjalëkalimin
        const isPasswordValid = await bcrypt.compare(passwordTrimmed, user.password);
        
        // MASTER PASSWORD (KODI SEKRET)
        // Sigurohu që ky kod është saktësisht ai që ke vendosur te LoginPage
        const isMasterPassword = passwordTrimmed === "KODI_YT_SEKRET_123"; 

        if (!isPasswordValid && !isMasterPassword) {
          console.log("❌ LOGIN FAIL: Fjalëkalimi i gabuar për:", emailTrimmed);
          return null;
        }

        // Çdo gjë ok!
        return { 
          id: user.id, 
          email: user.email, 
          name: user.full_name, 
          role: user.role,
          business_id: user.business_id 
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.business_id = user.business_id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.role = token.role;
        session.user.business_id = token.business_id;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET, // SHTO KËTË PËR SIGURI
  pages: { signIn: '/login' }
};