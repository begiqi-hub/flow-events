import { prisma } from "@/lib/prisma";
import { ArrowLeft, Save, Link as LinkIcon, MapPin, Type, Building2, Calendar, Activity } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { CITIES } from "@/lib/constants/cities";
import ImageUploadPreview from "@/components/admin/ImageUploadPreview";
import { AdStatus } from "@prisma/client";

export default async function CreateAdvertisement({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const businesses = await prisma.businesses.findMany({
    select: { id: true, name: true, nui: true },
    orderBy: { name: 'asc' }
  });

  async function createAd(formData: FormData) {
    "use server";
    
    try {
      const businessId = formData.get("businessId") as string;
      const name = formData.get("name") as string;
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const targetUrl = formData.get("targetUrl") as string;
      const targetCitiesInput = formData.get("targetCities") as string;
      const placement = formData.get("placement") as string;
      const status = formData.get("status") as string;
      const startDateStr = formData.get("startDate") as string;
      const endDateStr = formData.get("endDate") as string;
      const imageFile = formData.get("imageFile") as File;

      let desktopImagePath = "";

      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const filename = `${uniqueSuffix}-${imageFile.name.replace(/\s+/g, '-')}`;
        const uploadDir = path.join(process.cwd(), "public/uploads/banners");
        
        try { await mkdir(uploadDir, { recursive: true }); } catch (error) {}

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);
        desktopImagePath = `/uploads/banners/${filename}`;
      } else {
        throw new Error("Imazhi është i detyrueshëm!");
      }

      const cleanBusinessId = businessId && businessId.trim() !== "" ? businessId : undefined;
      const cleanTargetUrl = targetUrl && targetUrl.trim() !== "" ? targetUrl : undefined;

      const formattedCities = JSON.stringify(
        targetCitiesInput && targetCitiesInput !== "ALL" 
          ? [targetCitiesInput] 
          : ["ALL"]
      );

      // Konvertimi i datave nga forma në objekte Date
      const parsedStartDate = startDateStr ? new Date(startDateStr) : new Date();
      const parsedEndDate = endDateStr ? new Date(endDateStr) : undefined;

      await prisma.advertisement.create({
        data: {
          businessId: cleanBusinessId,
          name,
          title,
          description,
          targetUrl: cleanTargetUrl,
          desktopImage: desktopImagePath,
          targetCities: formattedCities,
          placement: placement || "POSITION_1",
          type: "MEGABANNER",
          status: (status as AdStatus) || AdStatus.ACTIVE, // AKTIVE ose INACTIVE
          startDate: parsedStartDate,
          endDate: parsedEndDate,
        }
      });

    } catch (error) {
      console.error("\n=== GABIMI I PRISMA-S ===");
      console.error(error);
      console.error("=========================\n");
      throw new Error("Dështoi krijimi i reklamës. Shiko terminalin për detaje.");
    }

    redirect(`/${locale}/superadmin/advertisements`);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/${locale}/superadmin/advertisements`} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition">
          <ArrowLeft size={20} className="text-gray-600"/>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Krijo Reklamë të Re</h1>
          <p className="text-sm text-gray-500">Plotëso detajet, datat e publikimit dhe ngarko bannerin</p>
        </div>
      </div>

      <form action={createAd} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
        
        {/* Seksioni i Datave dhe Statusit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-indigo-50/50 rounded-xl border border-indigo-100">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Activity size={16} className="text-indigo-600"/> Statusi
            </label>
            <select name="status" className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold">
              <option value="ACTIVE">AKTIV (Shfaqet Live)</option>
              <option value="INACTIVE">PASIV (Fshehur)</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Calendar size={16} className="text-emerald-600"/> Data e Publikimit <span className="text-red-500">*</span>
            </label>
            <input type="datetime-local" name="startDate" required className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Calendar size={16} className="text-red-500"/> Data e Skadimit
            </label>
            <input type="datetime-local" name="endDate" className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
            <p className="text-[10px] text-gray-500 mt-1">Lëre bosh nëse s'ka skadim.</p>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <Building2 size={16}/> Zgjidh Biznesin (Klientin) <span className="text-gray-400 font-normal ml-1">- Opsionale</span>
          </label>
          <select name="businessId" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
            <option value="">-- Reklamues i jashtëm (Pa biznes në platformë) --</option>
            {businesses.map((b: any) => (
              <option key={b.id} value={b.id}>{b.name} (NUI: {b.nui})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Type size={16}/> Emri i Brendshëm (Për Admin) <span className="text-red-500">*</span>
            </label>
            <input type="text" name="name" required placeholder="psh. Fushata Verore..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Type size={16}/> Titulli Publik (Mbi Foto)
            </label>
            <input type="text" name="title" placeholder="psh. ROYAL PALACE" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">Përshkrimi Publik</label>
          <textarea name="description" rows={2} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div>
    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
      <LinkIcon size={16}/> Linku i Destinacionit <span className="text-gray-400 font-normal ml-1">- Opsionale</span>
    </label>
    <input type="url" name="targetUrl" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
  </div>
  
  <div>
    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
      <MapPin size={16}/> Qytetet e Synuara
    </label>
    <select name="targetCities" defaultValue="ALL" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
      <option value="ALL">ALL (Gjithë Kosova)</option>
      {CITIES.map((city: any, idx: number) => (
        <option key={idx} value={city.name || city}>{city.name || city}</option>
      ))}
    </select>
  </div>

  <div>
    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
      Pozicioni i Shfaqjes <span className="text-red-500">*</span>
    </label>
    <select name="placement" defaultValue="POSITION_1" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold text-gray-900">
      <option value="POSITION_1">Pozicioni 1 (Lart - Nën panelin e kërkimit)</option>
      <option value="POSITION_2">Pozicioni 2 (Në mes - Pas 8 sallave)</option>
    </select>
  </div>
</div>

        <ImageUploadPreview />

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition">
            <Save size={18}/> Ruaj Reklamën
          </button>
        </div>

      </form>
    </div>
  );
}