import { prisma } from "@/lib/prisma";
import { AdStatus } from "@prisma/client";
import { ArrowLeft, Save, Link as LinkIcon, MapPin, Type, Building2, Calendar, Activity, ImageIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { CITIES } from "@/lib/constants/cities";
import Image from "next/image";

export default async function EditAdvertisement({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params;
  
  // Lexojmë të dhënat ekzistuese të reklamës
  const ad = await prisma.advertisement.findUnique({
    where: { id },
    include: { business: true }
  });

  if (!ad) {
    redirect(`/${locale}/superadmin/advertisements`);
  }

  const businesses = await prisma.businesses.findMany({
    select: { id: true, name: true, nui: true },
    orderBy: { name: 'asc' }
  });

  // Funksioni ndihmës për të formatuar datën për input type="datetime-local"
  const formatForInput = (date: Date | null) => {
    if (!date) return "";
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  async function updateAd(formData: FormData) {
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

      let desktopImagePath = ad?.desktopImage || ""; // Mbajmë imazhin e vjetër si default

      // Ruajmë imazhin e ri VETËM nëse përdoruesi ngarkon një të tillë
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
      }

      const cleanBusinessId = businessId && businessId.trim() !== "" ? businessId : undefined;
      const cleanTargetUrl = targetUrl && targetUrl.trim() !== "" ? targetUrl : undefined;

      const formattedCities = JSON.stringify(
        targetCitiesInput && targetCitiesInput !== "ALL" 
          ? [targetCitiesInput] 
          : ["ALL"]
      );

      const parsedStartDate = startDateStr ? new Date(startDateStr) : new Date();
      const parsedEndDate = endDateStr ? new Date(endDateStr) : undefined;

      await prisma.advertisement.update({
        where: { id },
        data: {
          businessId: cleanBusinessId,
          name,
          title,
          description,
          targetUrl: cleanTargetUrl,
          desktopImage: desktopImagePath,
          targetCities: formattedCities,
          placement: placement || "POSITION_1",
          status: (status as AdStatus) || AdStatus.ACTIVE,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
        }
      });

    } catch (error) {
      console.error("\n=== GABIMI I PRISMA-S ===");
      console.error(error);
      throw new Error("Dështoi përditësimi i reklamës.");
    }

    redirect(`/${locale}/superadmin/advertisements`);
  }

  // Deserializimi i qyteteve ekzistuese (nga JSON tek string)
  let currentCity = "ALL";
  try {
    const parsedCities = ad.targetCities ? JSON.parse(ad.targetCities) : ["ALL"];
    currentCity = parsedCities[0];
  } catch(e) {}

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/${locale}/superadmin/advertisements`} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition">
          <ArrowLeft size={20} className="text-gray-600"/>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Ndrysho Reklamën</h1>
          <p className="text-sm text-gray-500">Përditëso detajet për fushata: {ad.name}</p>
        </div>
      </div>

      <form action={updateAd} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
        
        {/* Datat dhe Statusi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-indigo-50/50 rounded-xl border border-indigo-100">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Activity size={16} className="text-indigo-600"/> Statusi
            </label>
            <select name="status" defaultValue={ad.status} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold">
              <option value="ACTIVE">AKTIV (Shfaqet Live)</option>
              <option value="INACTIVE">PASIV (Fshehur)</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Calendar size={16} className="text-emerald-600"/> Data e Publikimit <span className="text-red-500">*</span>
            </label>
            <input type="datetime-local" name="startDate" defaultValue={formatForInput(ad.startDate)} required className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Calendar size={16} className="text-red-500"/> Data e Skadimit
            </label>
            <input type="datetime-local" name="endDate" defaultValue={formatForInput(ad.endDate)} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <Building2 size={16}/> Zgjidh Biznesin (Klientin) <span className="text-gray-400 font-normal ml-1">- Opsionale</span>
          </label>
          <select name="businessId" defaultValue={ad.businessId || ""} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
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
            <input type="text" name="name" defaultValue={ad.name} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Type size={16}/> Titulli Publik (Mbi Foto)
            </label>
            <input type="text" name="title" defaultValue={ad.title || ""} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">Përshkrimi Publik</label>
          <textarea name="description" rows={2} defaultValue={ad.description || ""} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <LinkIcon size={16}/> Url <span className="text-gray-400 font-normal ml-1">- Opsionale</span>
            </label>
            <input type="url" name="targetUrl" defaultValue={ad?.targetUrl || ""} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <MapPin size={16}/> Qytetet e Synuara
            </label>
            <select name="targetCities" defaultValue={currentCity || "ALL"} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
              <option value="ALL">ALL (Gjithë Kosova)</option>
              {CITIES.map((city: any, idx: number) => (
                <option key={idx} value={city.name || city}>{city.name || city}</option>
              ))}
            </select>
          </div>

          {/* Fusha e re e Pozicionit e shtuar këtu */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              Pozicioni i Shfaqjes <span className="text-red-500">*</span>
            </label>
            <select name="placement" defaultValue={ad?.placement || "POSITION_1"} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold text-gray-900">
              <option value="POSITION_1">Pozicioni 1 (Lart - Nën kërkimin)</option>
              <option value="POSITION_2">Pozicioni 2 (Në mes - Pas 8 sallave)</option>
            </select>
          </div>
        </div>

        {/* Ngarkimi i Imazhit të Ri opsional me shfaqje të atij ekzistues */}
        <div className="p-6 border border-gray-200 rounded-xl bg-gray-50 flex gap-6 items-center">
          <div className="w-48 h-24 relative rounded-lg overflow-hidden border border-gray-300">
             <Image src={ad.desktopImage} alt="Current banner" fill className="object-cover" />
          </div>
          <div className="flex-1">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <ImageIcon size={16}/> Ndrysho Imazhin <span className="text-gray-400 font-normal ml-1">- Lëre bosh për të mbajtur të vjetrin</span>
            </label>
            <input 
              type="file" 
              name="imageFile" 
              accept="image/*" 
              className="w-full p-2 bg-white border border-gray-200 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700" 
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition">
            <Save size={18}/> Përditëso Reklamën
          </button>
        </div>

      </form>
    </div>
  );
}