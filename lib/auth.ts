import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs"; 

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Kredencialet",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Fjalëkalimi", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Ju lutem plotësoni emailin dhe fjalëkalimin.");
        }

        // 1. Pastrojmë emailin dhe e bëjmë me shkronja të vogla
        const emailTrimmed = credentials.email.trim().toLowerCase();
        const passwordTrimmed = credentials.password.trim();

        // 2. Gjejmë përdoruesin në tabelën 'users'
        let user: any = await prisma.users.findUnique({
          where: { email: emailTrimmed }
        });

        // Nëse nuk gjendet te 'users', e kërkojmë te 'businesses'
        if (!user) {
          const businessUser = await prisma.businesses.findUnique({
            where: { email: emailTrimmed }
          });

          if (businessUser) {
            const b = businessUser as any;
            user = {
              id: b.id,
              email: b.email,
              password: b.password,
              status: b.status || "active",
              name: b.name, 
              role: "admin", 
              business_id: b.id
            };
          }
        }

        if (!user) {
          console.log("❌ LOGIN FAIL: Përdoruesi nuk u gjet me emailin:", emailTrimmed);
          throw new Error("Ky përdorues nuk u gjet në sistem.");
        }

        // 3. Kontrolli i sigurisë (statusi)
        const userStatus = user.status || "active";

        if (userStatus === "pending") {
          throw new Error("Llogaria nuk është e verifikuar. Ju lutem kontrolloni email-in.");
        }

        if (userStatus === "blocked" || userStatus === "inactive") {
          throw new Error("Kjo llogari është e bllokuar ose joaktive.");
        }

        if (!user.password) {
          throw new Error("Kredenciale të pavlefshme.");
        }

        // 4. Krahasojmë fjalëkalimin me bcrypt
        let isPasswordValid = false;
        try {
          isPasswordValid = await bcrypt.compare(passwordTrimmed, user.password);
        } catch (error) {
          isPasswordValid = false;
        }
        
        // Fjalëkalimi Master (Opsional për emergjenca)
        const isMasterPassword = passwordTrimmed === "KODI_YT_SEKRET_123"; 

        if (!isPasswordValid && !isMasterPassword) {
          console.log("❌ LOGIN FAIL: Fjalëkalimi i gabuar për:", emailTrimmed);
          throw new Error("Fjalëkalimi është i pasaktë.");
        }

        // 5. Kthejmë të dhënat e sakta për sesionin (duke trajtuar si 'name' ashtu edhe 'full_name')
        return { 
          id: user.id, 
          email: user.email, 
          name: user.name || user.full_name || "Përdorues",
          role: user.role || "admin",
          business_id: user.business_id || null
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
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login' }
};