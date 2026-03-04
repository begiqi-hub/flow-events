export { default } from "next-auth/middleware"

// Këtu i tregojmë cilat faqe duam të mbyllim me çelës
export const config = {
  matcher: [
    "/",          // Mbyll Dashboard-in
    "/bookings",  // Mbyll Rezervimet
    // "/halls",  // Mund t'i heqësh komentet kur të krijosh këto faqe
    // "/clients"
  ]
}