"use client";

import { useState, useEffect } from "react";
import { getActiveAd } from "@/app/actions/ads";
import { X } from "lucide-react";

type AdData = {
  id: string;
  imageUrl: string;
  linkUrl: string | null;
};

export default function GlobalAdPopup() {
  const [ad, setAd] = useState<AdData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mengecek apakah iklan sudah pernah ditutup di sesi ini
    const hasSeenAd = sessionStorage.getItem("hasSeenAd");
    if (hasSeenAd) return;

    const fetchAd = async () => {
      try {
        const activeAd = await getActiveAd();
        if (activeAd) {
          setAd(activeAd);
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Gagal memuat iklan:", error);
      }
    };

    fetchAd();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("hasSeenAd", "true");
  };

  if (!isVisible || !ad) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full animate-in zoom-in-95 duration-200">
        
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <a 
          href={ad.linkUrl || "#"} 
          target={ad.linkUrl ? "_blank" : "_self"} 
          rel="noopener noreferrer"
          className="block w-full cursor-pointer"
          onClick={!ad.linkUrl ? handleClose : undefined}
        >
          <img 
            src={ad.imageUrl} 
            alt="Advertisement" 
            className="w-full h-auto max-h-[80vh] object-cover"
          />
        </a>
        
        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">Iklan Sponsor</p>
        </div>

      </div>
    </div>
  );
}
