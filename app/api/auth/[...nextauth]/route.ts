import NextAuth from "next-auth";
import { authOptions } from "../../../../lib/auth"; // Kontrollo rrugën nëse është saktë

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };