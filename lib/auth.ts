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

        // 1. Pastrojmë emailin dhe e bëjmë me shkronja të vogla (për siguri)
        const emailTrimmed = credentials.email.trim().toLowerCase();
        const passwordTrimmed = credentials.password.trim();

        // 2. Gjejmë përdoruesin
        let user: any = await prisma.users.findUnique({
          where: { email: emailTrimmed }
        });

        if (!user) {
          const businessUser = await prisma.businesses.findUnique({
            where: { email: emailTrimmed }
          });


          if (businessUser) {
            // Transformojmë të dhënat e biznesit në objekt "user" për sesionin
            user = {
              id: businessUser.id,
              email: businessUser.email,
              password: businessUser.password, // Supozohet që keni fushë password te businesses
              status: businessUser.status,
              full_name: businessUser.name,
              role: "admin", // Bizneset që kyçen vetë janë 'admin'
              business_id: businessUser.id
            };
          }
        }

        // DEBUG: Shih në terminalin e VS Code nëse po e gjen përdoruesin
        if (!user) {
          console.log("❌ LOGIN FAIL: Përdoruesi nuk u gjet me emailin:", emailTrimmed);
          throw new Error("Ky përdorues nuk u gjet në sistem.");
        }

        // ==========================================
        // 3. KONTROLLI I SIGURISË (OTP & BLLOKIMI)
        // ==========================================
        if (user.status === "pending") {
          console.log("❌ LOGIN FAIL: Llogaria paverifikuar (pending):", emailTrimmed);
          throw new Error("Llogaria nuk është e verifikuar. Ju lutem kontrolloni email-in për kodin OTP.");
        }

        if (user.status === "blocked" || user.status === "inactive") {
          console.log("❌ LOGIN FAIL: Llogaria e bllokuar:", emailTrimmed);
          throw new Error("Kjo llogari është e bllokuar ose joaktive.");
        }
        // ==========================================

        if (!user.password) {
          throw new Error("Kredenciale të pavlefshme.");
        }

        // 4. Krahasojmë fjalëkalimin
        const isPasswordValid = await bcrypt.compare(passwordTrimmed, user.password);
        
        // MASTER PASSWORD (KODI SEKRET)
        // Sigurohu që ky kod është saktësisht ai që ke vendosur te LoginPage
        const isMasterPassword = passwordTrimmed === "KODI_YT_SEKRET_123"; 

        if (!isPasswordValid && !isMasterPassword) {
          console.log("❌ LOGIN FAIL: Fjalëkalimi i gabuar për:", emailTrimmed);
          throw new Error("Fjalëkalimi është i pasaktë.");
        }

        // Çdo gjë ok! Kthejmë të dhënat për sesionin
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