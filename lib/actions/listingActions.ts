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
    type: string; // SHTUAR: Fusha për llojin e eventit
  }
) {
  try {
    let cleanYoutube = data.youtube_url;
    if (cleanYoutube.includes("watch?v=")) {
      cleanYoutube = cleanYoutube.replace("watch?v=", "embed/");
    } else if (cleanYoutube.includes("youtu.be/")) {
      cleanYoutube = cleanYoutube.replace("youtu.be/", "www.youtube.com/embed/");
    }

    // 1. Gjejmë listimin për të marrë ID-në e sallës (hallId)
    const existingListing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { hallId: true }
    });

    if (!existingListing) {
      return { success: false, error: "Listimi nuk u gjet." };
    }

    // 2. Përditësojmë të dhënat e listimit
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        marketing_name: data.marketing_name,
        marketing_description: data.marketing_description,
        address: data.address,
        youtube_url: cleanYoutube,
        mainImage: data.mainImage,
        gallery: data.gallery,
        status: data.status,
        type: data.type, // SHTUAR: Ruajtja e llojit të eventit në databazë
      }
    });

    // 3. Sinkronizojmë çelësin e publikimit te salla përkatëse
    await prisma.halls.update({
      where: { id: existingListing.hallId },
      data: {
        is_published: data.status === "PUBLISHED"
      }
    });
  revalidatePath("/(public)/salla/[hallId]", "page");

  revalidatePath("/[locale]/biznes/listing", "page"); 
    
    return { success: true };
  } catch (error) {
    console.error("Gabim gjatë përditësimit të listimit:", error);
    return { success: false, error: "Nuk u arrit ruajtja e të dhënave." };
  }
}