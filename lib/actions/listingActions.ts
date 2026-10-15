"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateListing(
  listingId: string, 
  data: {
    marketing_name: string;
    marketing_description: string;
    address: string;
    youtube_url: string;
    mainImage: string;
    gallery: string[];
    status: "DRAFT" | "PUBLISHED" | "INACTIVE";
    type: string; 
  }
) {
  try {
    // Shtojmë mbrojtje nëse youtube_url vjen e zbrazët (null/undefined)
    let cleanYoutube = data.youtube_url || ""; 
    
    if (cleanYoutube && cleanYoutube.includes("watch?v=")) {
      cleanYoutube = cleanYoutube.replace("watch?v=", "embed/");
    } else if (cleanYoutube && cleanYoutube.includes("youtu.be/")) {
      cleanYoutube = cleanYoutube.replace("youtu.be/", "www.youtube.com/embed/");
    }

    const existingListing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { hallId: true }
    });

    if (!existingListing) {
      return { success: false, error: "Listimi nuk u gjet." };
    }

    await prisma.listing.update({
      where: { id: listingId },
      data: {
        marketing_name: data.marketing_name,
        marketing_description: data.marketing_description,
        address: data.address,
        youtube_url: cleanYoutube,
        mainImage: data.mainImage,
        gallery: data.gallery ? JSON.stringify(data.gallery) : "[]", // Konverton listën në tekst
        status: data.status,
        type: data.type, 
      }
    });

    await prisma.halls.update({
      where: { id: existingListing.hallId },
      data: {
        is_published: data.status === "PUBLISHED"
      }
    });

    revalidatePath("/(public)/salla/[hallId]", "page");
    revalidatePath("/[locale]/biznes/listing", "page"); 
    
    return { success: true };
  } catch (error: any) {
    console.error("Gabim i detajuar nga Prisma:", error);
    
    // KËTU ËSHTË NDRYSHIMI: Tani po kthejmë gabimin e vërtetë teknik në Frontend
    return { 
      success: false, 
      error: `Gabim Database: ${error.message || "Gabim i panjohur teknik."}` 
    };
  }
}