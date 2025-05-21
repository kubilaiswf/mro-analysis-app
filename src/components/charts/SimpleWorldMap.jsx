import React from 'react';
import { mroFirmalari } from '../../data/maintenanceData';

// MRO renkleri
const mroColors = [
  "#1e3a8a", "#4338ca", "#7e22ce", "#be185d", "#ea580c", 
  "#0891b2", "#059669", "#4d7c0f", "#854d0e", "#b91c1c"
];

// Ülke grupları
const regions = {
  "Avrupa": ["Almanya", "Fransa", "İtalya", "İspanya", "Birleşik Krallık", "İngiltere", "Polonya", "Romanya", "Hollanda", "Belçika", "İsveç", "Çekya", "Yunanistan", "Portekiz", "Macaristan", "Avusturya", "İsviçre", "Bulgaristan", "Danimarka", "Finlandiya", "Slovakya", "Norveç", "İrlanda", "Hırvatistan", "Moldova", "Bosna Hersek", "Arnavutluk", "Litvanya", "Slovenya", "Letonya", "Estonya", "Kıbrıs", "Lüksemburg", "Malta", "İzlanda", "Karadağ", "Kuzey Makedonya", "Sırbistan"],
  "Asya": ["Çin", "Japonya", "Hindistan", "Güney Kore", "Endonezya", "Suudi Arabistan", "Türkiye", "İran", "Tayland", "Birleşik Arap Emirlikleri", "Malezya", "Singapur", "Kazakistan", "Filipinler", "Pakistan", "Vietnam", "Bangladeş", "Irak", "Katar", "Hong Kong", "Kuveyt", "Umman", "Sri Lanka", "Myanmar", "Ürdün", "Azerbaycan", "Lübnan", "Özbekistan", "Yemen", "Türkmenistan", "Bahreyn", "Afganistan", "Nepal", "Filistin", "Tacikistan", "Kırgızistan", "Moğolistan", "Kuzey Kore", "Brunei", "Doğu Timor", "Bhutan", "Maldivler"],
  "Kuzey Amerika": ["ABD", "Kanada", "Meksika", "Guatemala", "Küba", "Dominik Cumhuriyeti", "Haiti", "Honduras", "El Salvador", "Nikaragua", "Kosta Rika", "Panama", "Jamaika"],
  "Güney Amerika": ["Brezilya", "Arjantin", "Kolombiya", "Şili", "Peru", "Venezuela", "Ekvador", "Bolivya", "Paraguay", "Uruguay", "Guyana", "Surinam", "Fransız Guyanası"],
  "Afrika": ["Nijerya", "Güney Afrika", "Mısır", "Cezayir", "Fas", "Etiyopya", "Kenya", "Gana", "Angola", "Tanzanya", "Libya", "Tunus", "Uganda", "Zimbabwe", "Senegal", "Zambiya", "Ruanda", "Namibya", "Botsvana", "Gabon", "Mozambik"],
  "Okyanusya": ["Avustralya", "Yeni Zelanda", "Papua Yeni Gine", "Fiji", "Solomon Adaları", "Vanuatu", "Samoa", "Tonga", "Kiribati", "Mikronezya", "Marshall Adaları", "Palau", "Nauru", "Tuvalu"]
};

const SimpleWorldMap = () => {
  console.log("SimpleWorldMap.jsx: Rendering component.");

  // Her MRO firmasının bölgelere göre müşteri sayısını hesapla
  const mroRegionData = React.useMemo(() => {
    console.log("SimpleWorldMap.jsx: Calculating mroRegionData. mroFirmalari:", mroFirmalari);
    const data = [];
    
    if (!mroFirmalari || !Array.isArray(mroFirmalari)) {
      console.error("SimpleWorldMap.jsx: mroFirmalari is not a valid array!");
      return [];
    }

    mroFirmalari.forEach((mro, mroIndex) => {
      const regionCounts = {};
      
      if (mro.musteriPortfoyu && Array.isArray(mro.musteriPortfoyu)) {
        mro.musteriPortfoyu.forEach(musteri => {
          if (!musteri.ulke) return;
          
          let foundRegion = null;
          Object.entries(regions).forEach(([region, countries]) => {
            if (countries.includes(musteri.ulke)) {
              foundRegion = region;
            }
          });
          
          if (foundRegion) {
            regionCounts[foundRegion] = (regionCounts[foundRegion] || 0) + 1;
          }
        });
      }
      
      data.push({
        mroId: mroIndex,
        mroName: mro.mroFirmasiAdi,
        color: mroColors[mroIndex % mroColors.length],
        regions: regionCounts
      });
    });
    
    console.log("SimpleWorldMap.jsx: Calculated mroRegionData:", data);
    return data;
  }, []);
  
  if (mroRegionData.length === 0) {
    console.warn("SimpleWorldMap.jsx: mroRegionData is empty. No map data to display.");
    return (
      <div className="h-[400px] bg-yellow-100 rounded-xl shadow-md overflow-hidden flex items-center justify-center">
        <p className="text-yellow-700">Harita için veri bulunamadı veya işlenemedi.</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] bg-blue-50 rounded-xl shadow-md overflow-hidden border-2 border-blue-300">
      <h3 className="text-xl font-bold text-gray-800 px-4 py-3 border-b border-blue-200 bg-blue-100">
        Kıtalara Göre MRO Dağılımı
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 h-[340px] overflow-y-auto">
        {Object.keys(regions).map((region) => (
          <div key={region} className="bg-white rounded-lg p-3 shadow-sm border border-blue-100">
            <h4 className="font-medium text-sm mb-2 text-blue-800 border-b pb-1">{region}</h4>
            {mroRegionData.map((mro) => {
              return mro.regions[region] > 0 && (
                <div key={mro.mroId} className="flex items-center mb-1">
                  <div 
                    className="w-3 h-3 rounded-full mr-1.5 flex-shrink-0" 
                    style={{ backgroundColor: mro.color }}
                  ></div>
                  <div className="text-xs truncate">
                    <span className="font-medium">{mro.mroName}</span> ({mro.regions[region]})
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleWorldMap; 