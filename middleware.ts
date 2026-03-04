import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // I tregojmë saktësisht ku është dera e hyrjes
  },
});

export const config = {
  matcher: [
    "/",          // Mbrojmë Dashboard-in
    "/bookings",  // Mbrojmë Rezervimet
  ],
};