import React, { useEffect, useState, useMemo } from 'react';
import { FaGlobe, FaInfoCircle } from 'react-icons/fa';
import SimpleWorldMap from '../components/charts/SimpleWorldMap';
import { mroFirmalari } from '../data/maintenanceData';
import { cityCoordinates, cityToMroMapping } from '../data/cityCoordinates';
import ContinentMap from '../components/charts/ContinentMap';

const HomePage = () => {
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [missingMROInfo, setMissingMROInfo] = useState([]);

  useEffect(() => {
    console.log("HomePage.jsx: Component did mount.");
    console.log("HomePage.jsx: mroFirmalari data:", mroFirmalari);
    
    if (typeof SimpleWorldMap === 'undefined') {
      console.error("HomePage.jsx: SimpleWorldMap is undefined! Check import.");
    } else {
      console.log("HomePage.jsx: SimpleWorldMap component is imported:", SimpleWorldMap);
    }
  }, []);

  console.log("HomePage.jsx: Rendering HomePage component.");

  // Eksik MRO pinlerini tespit etme fonksiyonu
  const findMissingMROPins = () => {
    const missingMROs = mroFirmalari.filter(mro => {
      // Manuel override kontrol listesindeki şehirleri varsayılan olarak ayır
      const manualOverrideList = {
        "AJW Technique": "Montreal",
        "Aeroplex of Central Europe": "Budapest",
        "Ameco Beijing": "Beijing",
        "AMTES GmbH": "Leipzig", 
        "BCT Aviation Maintenance": "East Midlands",
        "Bedek - IAI": "Tel Aviv",
        "Bird Aviation": "Larnaca",
        "Atitech S.p.A.": "Naples",
        "AerFin": "Cardiff",
        "Apella S.A.": "Athens",
        "Atlantic Aviation Group": "Shannon",
        "Ethiopian MRO": "Addis Ababa",
        "Etihad Engineering": "Abu Dhabi",
        "AEI Aeronautical Engineers, Inc.": "Miami",
        "FEAM Maintenance/Engineering": "Cincinnati",
        "2Excel Engineering Ltd": "Lasham",
        "GA Telesis Engine Services (GATES)": "Vantaa",
        "AAR Corp": "Wood Dale",
        "Adria Tehnika": "Ljubljana",
        "Aviation Technical Services (ATS)": "Everett",
        "Iberia Maintenance": "Madrid",
        "GMF AeroAsia (PT Garuda Maintenance Facility Aero Asia Tbk)": "Jakarta",
        "HAECO Group (Hong Kong Aircraft Engineering Company Limited)": "Xiamen",
        "Aerospace Rotables": "Phoenix",
        "Aerostar S.A.": "Bacău",
        "AI Engineering Services Limited (AIESL)": "Delhi",
        "Air Works": "Delhi",
        "Airborne Maintenance & Engineering Services (AMES)": "Tampa",
        "Cascade Aerospace": "Abbotsford",
        "Certified Aviation Services (CAS)": "Ontario", 
        "China Aircraft Services Limited (CASL)": "Hong Kong",
        "COOPESA R.L. (Cooperativa Autogestionaria de Servicios Aeroindustriales)": "San Jose",
        "Delta TechOps": "Atlanta",
        "Magnetic Line (Direct Maintenance)": "Amsterdam",
        "Egyptair Maintenance & Engineering (EGME)": "Cairo",
        "EFW (Elbe Flugzeugwerke GmbH)": "Dresden",
        "Dublin Aerospace Group": "Dublin",
        "ETG Maintenance (Elektra Trans Global)": "Varna",
        "S7 Technics": "Moscow",
        "KQ MRO (Kenya Airways MRO)": "Nairobi",
        "Korean Air Maintenance and Engineering": "Incheon",
        "KLM UK Engineering Limited MRO": "Norwich",
        "LOT Aircraft Maintenance Services (LOTAMS)": "Warsaw",
        "Lufthansa Technik AG": "Hamburg"
      };

      // MRO için şehir bulmaya çalış
      const city = manualOverrideList[mro.mroFirmasiAdi] || 
                   (mro.hangarVeTesisKonumlari && mro.hangarVeTesisKonumlari.length > 0 ? 
                      extractCityFromLocation(mro.hangarVeTesisKonumlari[0].konum) : null);

      // Şehir bulunamadı veya koordinatlar bulunamadı
      if (!city || !cityCoordinates[city]) {
        return true; // Bu MRO eksik
      }
      
      return false; // Bu MRO haritada gösteriliyor
    });

    // Eksik MRO'lar hakkında bilgileri ayarla
    const missingInfo = missingMROs.map(mro => {
      const manualOverride = manualOverrideList && 
                            mro.mroFirmasiAdi in manualOverrideList ? 
                            manualOverrideList[mro.mroFirmasiAdi] : "Yok";
      
      const locationInfo = mro.hangarVeTesisKonumlari && 
                          mro.hangarVeTesisKonumlari.length > 0 ? 
                          mro.hangarVeTesisKonumlari[0].konum : "Konum bilgisi yok";
      
      return {
        adi: mro.mroFirmasiAdi,
        manuelAyar: manualOverride,
        tesisKonumu: locationInfo
      };
    });

    setMissingMROInfo(missingInfo);
    setShowDebugInfo(true);
  };

  // Şehir çıkarma yardımcı fonksiyonu
  const extractCityFromLocation = (locationStr) => {
    if (!locationStr) return null;
    
    // Konum string'inden şehir çıkarma mantığı
    // "City, Country" formatında ise
    const parts = locationStr.split(',');
    if (parts.length > 1) {
      return parts[0].trim();
    }
    
    return locationStr.trim();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-red-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center py-10">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-4">MRO Sektörü Analiz Paneli</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bu portal, havacılık sektöründe faaliyet gösteren MRO (Bakım, Onarım ve Revizyon) 
            firmaları hakkında detaylı analizler ve karşılaştırmalar sunmaktadır.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
            <h3 className="text-lg text-gray-600 mb-1">Analiz Edilen MRO Şirketi</h3>
            <div className="text-primary-500 text-4xl font-bold mb-2">{mroFirmalari.length}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
            <h3 className="text-lg text-gray-600 mb-1">Toplam Müşteri Sayısı</h3>
            <div className="text-primary-500 text-4xl font-bold mb-2">
              {mroFirmalari.reduce((total, mro) => 
                total + (mro.musteriPortfoyu ? mro.musteriPortfoyu.length : 0), 0)}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
            <h3 className="text-lg text-gray-600 mb-1">Toplam Sertifika Sayısı</h3>
            <div className="text-primary-500 text-4xl font-bold mb-2">
              {mroFirmalari.reduce((total, mro) => 
                total + (mro.sertifikalar ? mro.sertifikalar.length : 0), 0)}
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <button 
            onClick={findMissingMROPins}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors shadow-md"
          >
            Eksik MRO Pin'lerini Kontrol Et
          </button>
        </div>

        {showDebugInfo && missingMROInfo.length > 0 && (
          <div className="mb-10 bg-white p-4 rounded-lg shadow-lg max-w-4xl mx-auto overflow-auto">
            <h3 className="text-lg font-bold mb-2 text-red-600">Haritada Görünmeyen MRO Şirketleri ({missingMROInfo.length} adet):</h3>
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">MRO Adı</th>
                  <th className="border border-gray-300 px-4 py-2">Manuel Ayar</th>
                  <th className="border border-gray-300 px-4 py-2">Tesis Konumu</th>
                </tr>
              </thead>
              <tbody>
                {missingMROInfo.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 px-4 py-2">{item.adi}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.manuelAyar}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.tesisKonumu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                <strong>Ne yapılmalı?</strong> Bu MRO şirketlerinin pinlerini haritada göstermek için:
              </p>
              <ol className="list-decimal text-sm text-gray-600 pl-5 mt-2">
                <li>src/components/charts/MROWorldMap.jsx dosyasındaki manual override listesine bu şirketleri ve şehirlerini ekleyin</li>
                <li>src/data/cityCoordinates.js dosyasına eksik şehir koordinatlarını ekleyin</li>
                <li>Ayrıca cityToMroMapping nesnesine de şehir-MRO eşleştirmelerini ekleyin</li>
              </ol>
              <button 
                onClick={() => setShowDebugInfo(false)}
                className="mt-4 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Kapat
              </button>
            </div>
          </div>
        )}

        <section className="mb-12 bg-white rounded-xl shadow-lg overflow-hidden">
          <h2 className="text-3xl font-bold text-gray-800 px-6 pt-6 pb-4">MRO Firmalarının Küresel Dağılımı</h2>
          <div className="h-[600px]">
            <ContinentMap />
          </div>
        </section>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-xs opacity-60">
          ░▒▓█ 0x6b7562696c6169737766 was here █▓▒░
        </div>
      </div>
    </div>
  );
};

export default HomePage;