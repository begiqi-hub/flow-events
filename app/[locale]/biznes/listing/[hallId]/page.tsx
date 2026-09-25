// app/[locale]/biznes/listing/[hallId]/page.tsx
import React from "react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ListingEditForm from "./ListingEditForm";
import ListingClientForm from "./ListingClientForm";

export const dynamic = "force-dynamic";

export default async function EditListingPage({ 
  params 
}: { 
  params: Promise<{ locale: string, hallId: string }> 
}) {
  const { locale, hallId } = await params;
  
  const session = await getServerSession();
  const userEmail = session?.user?.email;
  if (!userEmail) redirect(`/${locale}/login`);

  const currentUser = await prisma.users.findUnique({
    where: { email: userEmail },
    select: { business_id: true }
  });

  const businessId = currentUser?.business_id;
  if (!businessId) redirect(`/${locale}/login`);

  // 1. Kontrollojmë fillimisht nëse salla ekziston dhe i përket këtij biznesi
  const hall = await prisma.halls.findFirst({
    where: { 
      id: hallId,
      business_id: businessId 
    },
    include: {
      listing: true
    }
  });

  if (!hall) redirect(`/${locale}/biznes/listing`);

  // 2. Nëse salla nuk ka ende një rekord në tabelën listing, e krijojmë automatikisht me connect
  let listing = hall.listing;
  if (!listing) {
    listing = await prisma.listing.create({
      data: {
        hall: { connect: { id: hall.id } },
        business: { connect: { id: businessId } },
        status: "DRAFT"
      }
    });
  }

  // Përgatisim objektin me të dhënat e sallës për formularin
  const listingWithHall = {
    ...listing,
    hall: {
      name: hall.name,
      capacity: hall.capacity,
      description: hall.description,
      image: hall.image
    }
  };

  const isReady = !!hall.description && (!!listing.mainImage || !!hall.image);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <Link href={`/${locale}/biznes/listing`} className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 transition">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kthehu te Listimet
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Menaxho Listimin Publik</h1>
          <p className="text-slate-500 text-sm mt-1">
            Këto të dhëna do të shfaqen në platformën publike HALLEVO. Emri i sallës suaj: <strong className="text-slate-700">"{hall.name}"</strong>.
          </p>
        </div>

        {/* Butoni i shpejtë për ndryshimin e statusit */}
        <div className="w-full md:w-80">
          <ListingClientForm 
            hallId={hall.id} 
            isReady={isReady} 
            currentStatus={listing.status} 
          />
        </div>
      </div>

      {/* Komponenti Klient për Formularin e Redaktimit */}
      <ListingEditForm listing={listingWithHall} />
    </div>
  );
}