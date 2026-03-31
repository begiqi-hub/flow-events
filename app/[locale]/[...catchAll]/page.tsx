import { notFound } from "next/navigation";

export default function CatchAllPage() {
  // Ky funksion e detyron Next.js të shfaqë skedarin tonë të bukur not-found.tsx
  notFound();
}
