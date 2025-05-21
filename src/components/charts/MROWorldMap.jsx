import React, { useState, useMemo, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { mroFirmalari } from '../../data/maintenanceData';
import { useNavigate } from 'react-router-dom';
import { cityCoordinates as cityGeoCoordinates, mroColors as mroCompanyColors } from '../../data/cityCoordinates';

// Şehir-ülke eşleşmesi için kullanacağımız map (satır 10-20 civarı)
const cityToCountryMapping = {
  "Montreal": "Canada",
  "London": "United Kingdom",
  "Budapest": "Hungary",
  "Bucharest": "Romania",
  "Beijing": "China",
  "Leipzig": "Germany",
  "Frankfurt": "Germany",
  "East Midlands": "United Kingdom",
  "Tel Aviv": "Israel",
  "Larnaca": "Cyprus",
  "Athens": "Greece",
  "Naples": "Italy",
  "Rome": "Italy",
  "Olbia": "Italy",
  "Cardiff": "United Kingdom",
  "Miami": "USA",
  "Dothan": "USA",
  "Kelowna": "Canada",
  "Jinan": "China",
  "Xiamen": "China",
  "Haikou": "China",
  "Shannon": "Ireland",
  "Abu Dhabi": "UAE",
  "Addis Ababa": "Ethiopia",
  "Cincinnati": "USA",
  
  // Yeni şehir-ülke eşleştirmeleri
  "Atlanta": "USA",
  "Amsterdam": "Netherlands",
  "Bacău": "Romania",
  "Delhi": "India",
  "Tampa": "USA",
  "Abbotsford": "Canada",
  "Ontario": "USA",
  "San Jose": "Costa Rica",
  "Cairo": "Egypt",
  "Dresden": "Germany",
  "Dublin": "Ireland",
  "Varna": "Bulgaria",
  "Moscow": "Russia",
  "St. Petersburg": "Russia",
  "Nairobi": "Kenya",
  "Incheon": "South Korea",
  "Norwich": "United Kingdom",
  "Warsaw": "Poland",
  "Hamburg": "Germany",
  "Hong Kong": "China",
  "Phoenix": "USA"
};

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";


// MROWorldMap.jsx içindeki countryCoordinates ve mroColors array'ini kaldırın,
// çünkü bunları cityCoordinates.js'den alacağız.

const MROWorldMap = () => {
  const navigate = useNavigate();
  const [activeMarker, setActiveMarker] = useState(null); // Bu state'i MRO detayları için kullanabilirsiniz
  const [tooltipContent, setTooltipContent] = useState(""); // ReactTooltip için
  const [error, setError] = useState(null);

  // Aktif olarak gösterilecek MRO'ları tutmak için state
  // Başlangıçta tüm MRO'lar seçili olsun
  const [selectedMROs, setSelectedMROs] = useState(() => mroFirmalari.map(mro => mro.mroFirmasiAdi));

// MRO için merkez şehri belirleme fonksiyonu (satır 50-60 civarı)
const getHeadquarterCity = (mro) => {
  // 1. MANUEL OVERRIDE - Bazı MRO'lar için sabit şehir atamaları
  const manualOverrides = {
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
    
    // Yeni manuel override'lar
    "Aerospace Rotables": "Phoenix",
    "Aerostar S.A.": "Bacău",
    "AI Engineering Services Limited (AIESL)": "Delhi",
    "Air Works": "Delhi", // Indira yerine Delhi kullanıyoruz
    "Airborne Maintenance & Engineering Services (AMES)": "Tampa",
    "Cascade Aerospace": "Abbotsford",
    "Certified Aviation Services (CAS)": "Ontario", 
    "China Aircraft Services Limited (CASL)": "Hong Kong",
    "COOPESA R.L. (Cooperativa Autogestionaria de Servicios Aeroindustriales)": "San Jose", // Juan yerine
    "Delta TechOps": "Atlanta",
    "Magnetic Line (Direct Maintenance)": "Amsterdam",
    "Egyptair Maintenance & Engineering (EGME)": "Cairo", // Kahire yerine Cairo
    "EFW (Elbe Flugzeugwerke GmbH)": "Dresden",
    "Dublin Aerospace Group": "Dublin",
    "ETG Maintenance (Elektra Trans Global)": "Varna",
    "S7 Technics": "Moscow", // St. Petersburg yerine Moscow
    "KQ MRO (Kenya Airways MRO)": "Nairobi", // Kenya yerine Nairobi
    "Korean Air Maintenance and Engineering": "Incheon",
    "KLM UK Engineering Limited MRO": "Norwich",
    "LOT Aircraft Maintenance Services (LOTAMS)": "Warsaw", // Varşova yerine Warsaw
    "Lufthansa Technik AG": "Hamburg" // Almanya yerine Hamburg
  };

  // Manuel override kontrol et
  if (manualOverrides[mro.mroFirmasiAdi]) {
    return manualOverrides[mro.mroFirmasiAdi];
  }
  
  // ...mevcut kod devam eder

    // 2. TESIS KONUM ANALİZİ - Eğer manuel override yoksa tesis konumlarına bak
    if (mro.hangarVeTesisKonumlari && mro.hangarVeTesisKonumlari.length > 0) {
      // Ana tesis, merkez, HQ gibi anahtar kelimeler içeren konumu bul
      const mainFacilityKeywords = [
        "ana tesis", "hq", "merkez", "genel merkez", "ana bakım üssü", "ana üs",
        "headquarter", "main facility", "central", "base"
      ];

      let headquarterFacility = mro.hangarVeTesisKonumlari.find(f =>
        mainFacilityKeywords.some(keyword =>
          (f.konum && f.konum.toLowerCase().includes(keyword)) ||
          (f.detay && f.detay.toLowerCase().includes(keyword))
        )
      );

      // Merkez tesisi bulamazsan ilk tesisi kullan
      if (!headquarterFacility && mro.hangarVeTesisKonumlari.length > 0) {
        headquarterFacility = mro.hangarVeTesisKonumlari[0];
      }

      if (headquarterFacility && headquarterFacility.konum) {
        // Şehir adını çıkar (örn: "Montreal – Kanada (Ana Tesis)" -> "Montreal")
        const cityExtraction = (locationStr) => {
          // İlk olarak parantez içini temizle
          const withoutParentheses = locationStr.replace(/\([^)]*\)/g, '');

          // Tire, virgül veya boşlukla ayrılmış ilk kısmı al
          const parts = withoutParentheses.split(/[-–,]/);
          if (parts.length > 0) {
            // Başta ve sondaki boşlukları temizle
            return parts[0].trim();
          }
          return locationStr;
        };

        const extractedCity = cityExtraction(headquarterFacility.konum);

        const normalizeCity = (city) => {
          if (!city) return null;
          
          // Lowercase yapıp bazı kelimeleri çıkar
          const lowerCity = city.toLowerCase()
            .replace("uluslararası havalimanı", "")
            .replace("international airport", "")
            .replace("havalimanı", "")
            .replace("airport", "")
            .replace("ferenc liszt", "")
            .trim();
          
          // Şehir adı eşleştirmeleri
          const cityMapping = {
            "pekin": "Beijing",
            "budapeşte": "Budapest",
            "bükreş": "Bucharest",
            "larnaka": "Larnaca",
            "atina": "Athens",
            "napoli": "Naples",
            "roma": "Rome",
            "east midlands": "East Midlands",
            "londra": "London",
            "abu dabi": "Abu Dhabi",
            "addis ababa": "Addis Ababa",
            "capital": "Beijing",
            "ben gurion": "Tel Aviv",
            "cvg": "Cincinnati",
            "cincinnati/nk": "Cincinnati",
            "leipzig/halle": "Leipzig",
            
            // Yeni normalizasyon eşleştirmeleri
            "kahire": "Cairo",
            "varşova": "Warsaw",
            "indira gandhi": "Delhi",
            "san josé": "San Jose",
            "st. petersburg": "St. Petersburg",
            "nairobi": "Nairobi"
          };
          
          for (const [key, value] of Object.entries(cityMapping)) {
            if (lowerCity.includes(key)) {
              return value;
            }
          }
          
          // Eğer kelimeler arasında havalimanı, havaalanı vb. yoksa doğrudan ilk kelimeyi döndür
          const firstWord = city.split(/\s+/)[0];
          return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
        };

        return normalizeCity(extractedCity);
      }
    }

    // 3. KIMDIR METNİNDEN ANALİZ - Son çare olarak kimdir metni içindeki ipuçlarına bak
    if (mro.kimdir) {
      const kimdirText = mro.kimdir.toLowerCase();

      // "merkezi X'de" veya benzeri ifadeleri ara
      const merkezPatterns = [
        /merkezi\s+([^,.\s(]+(?:\s+[^,.\s(]+){0,2})(?:'nde|'de|'da|'te|'ta)/i,
        /merkezli\s+([^,.\s(]+(?:\s+[^,.\s(]+){0,2})/i,
        /([^,.\s(]+(?:\s+[^,.\s(]+){0,2})\s+merkezli/i,
        /([^,.\s(]+(?:\s+[^,.\s(]+){0,2})\s+kentinde/i,
        /([^,.\s(]+(?:\s+[^,.\s(]+){0,2})\s+şehrinde/i
      ];



      for (const pattern of merkezPatterns) {
        const match = kimdirText.match(pattern);
        if (match && match[1]) {
          const city = match[1].trim();

          // Şehir adı normalizasyonu
          const cityMapping = {
            "budapeşte": "Budapest",
            "pekin": "Beijing",
            "larnaka": "Larnaca",
            "atina": "Athens",
            "abu dabi": "Abu Dhabi",
            "addis ababa": "Addis Ababa",
            "miami": "Miami"
          };

          for (const [key, value] of Object.entries(cityMapping)) {
            if (city.includes(key)) {
              return value;
            }
          }

          return city.charAt(0).toUpperCase() + city.slice(1);
        }
      }
    }

    console.warn(`Merkez şehir belirlenemedi: ${mro.mroFirmasiAdi}`);
    return null;
  };

  // mroCityMarkers useMemo içinde, marker nesnesine countryName ekleyelim
  const mroCityMarkers = useMemo(() => {
    if (!mroFirmalari || !cityGeoCoordinates || !mroCompanyColors) {
      setError("Harita için gerekli veriler yüklenemedi.");
      return [];
    }
    return mroFirmalari
      .map((mro, index) => {
        const city = getHeadquarterCity(mro);
        if (!city) return null;

        const cityData = cityGeoCoordinates[city];
        if (!cityData) {
          console.warn(`Koordinat bulunamadı: "${city}" (MRO: ${mro.mroFirmasiAdi}). cityCoordinates.js dosyasında "${city}" anahtarı mevcut değil.`);
          return null;
        }
        
        const color = mroCompanyColors[mro.mroFirmasiAdi] || '#cccccc'; // Varsayılan renk
        const country = cityToCountryMapping[city] || "Unknown"; // Ülke bilgisi

        return {
          mroIndex: index, // Detay sayfasına yönlendirme için
          name: mro.mroFirmasiAdi,
          city,
          country, // Ülke bilgisini ekledik
          coordinates: [cityData.lng, cityData.lat], // react-simple-maps [lng, lat] bekler
          color,
        };
      })
      .filter(Boolean); // Null olanları filtrele
  }, [mroFirmalari]); 

  useEffect(() => {
    if (mroCityMarkers.length === 0 && mroFirmalari.length > 0 && !error) {
      // setError("MRO merkez şehirleri için harita üzerinde gösterilecek veri bulunamadı.");
      console.warn("MRO merkez şehirleri için harita üzerinde gösterilecek veri bulunamadı. cityCoordinates.js dosyasını ve getHeadquarterCity fonksiyonunu kontrol edin.");
    }
  }, [mroCityMarkers, mroFirmalari, error]);


  const handleMarkerClick = (mroIndex) => {
    // Tıklanan MRO'nun detaylarını göstermek için bir state güncellenebilir
    // veya doğrudan detay sayfasına yönlendirilebilir.
    // navigate(`/mro-detail/${mroIndex}`); // Eğer mroId olarak index kullanılıyorsa
    const mro = mroFirmalari[mroIndex];
    if (mro) {
      // Örnek: Aktif MRO'yu set etme (detay paneli için)
      // setActiveMarker(mro); 
      // Veya navigate
      const mroIdForPath = mroFirmalari.findIndex(item => item.mroFirmasiAdi === mro.mroFirmasiAdi);
      if (mroIdForPath !== -1) {
        navigate(`/mro-detail/${mroIdForPath}`);
      }
    }
  };

  const handleFilterChange = (mroName) => {
    setSelectedMROs(prev =>
      prev.includes(mroName)
        ? prev.filter(name => name !== mroName)
        : [...prev, mroName]
    );
  };

  if (error) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-red-100 rounded-xl p-4 border border-red-300">
        <p className="text-red-700 font-medium">Harita Yüklenemedi: {error}</p>
      </div>
    );
  }

  if (!mroFirmalari || mroFirmalari.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-xl p-4">
        <p className="text-gray-500">MRO verisi bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[600px] bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      {/* Filtre Paneli */}
      <div className="w-full md:w-64 bg-gray-700 p-4 overflow-y-auto text-white space-y-2">
        <h3 className="text-lg font-semibold mb-3">MRO Şirketleri</h3>
        {mroFirmalari.map((mro) => (
          <div key={mro.mroFirmasiAdi} className="flex items-center">
            <input
              type="checkbox"
              id={`filter-${mro.mroFirmasiAdi}`}
              checked={selectedMROs.includes(mro.mroFirmasiAdi)}
              onChange={() => handleFilterChange(mro.mroFirmasiAdi)}
              className="mr-2 h-4 w-4 text-primary-500 focus:ring-primary-400 border-gray-500 rounded bg-gray-600"
            />
            <label htmlFor={`filter-${mro.mroFirmasiAdi}`} className="text-sm flex items-center cursor-pointer">
              <span
                className="w-3 h-3 rounded-full mr-1.5 inline-block"
                style={{ backgroundColor: mroCompanyColors[mro.mroFirmasiAdi] || '#ccc' }}
              />
              {mro.mroFirmasiAdi}
            </label>
          </div>
        ))}
      </div>

      {/* Harita Alanı */}
      <div className="flex-grow relative">
        {mroCityMarkers.length === 0 && !error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <p className="text-gray-400 bg-gray-800 bg-opacity-70 p-4 rounded">Haritada gösterilecek MRO merkezi bulunamadı.</p>
          </div>
        )}
        <ComposableMap projection="geoMercator" style={{ width: "100%", height: "100%" }}>
          <ZoomableGroup center={[10, 0]} zoom={1}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#374151" // Koyu gri ülke dolgusu
                    stroke="#4B5563" // Biraz daha açık sınır
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#4B5563", outline: "none" }, // Hover rengi
                      pressed: { fill: "#2b3440", outline: "none" }, // Basılma rengi
                    }}
                  />
                ))
              }
            </Geographies>

            {mroCityMarkers
            .filter(marker => selectedMROs.includes(marker.name))
            .map(marker => (
            <Marker key={`${marker.name}-${marker.city}`} coordinates={marker.coordinates}>
              <g
                transform="translate(-7, -20)"
                className="cursor-pointer hover:opacity-90 transition-opacity"
                data-tooltip-id="mro-city-tooltip"
                data-tooltip-content={`${marker.name} - ${marker.country}, ${marker.city}`} // Ülke bilgisini ekledik
                onClick={() => handleMarkerClick(marker.mroIndex)}
              >
                {/* Custom SVG Pin küçültülmüş boyut */}
                <svg width="15px" height="20px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                  {/* Mevcut SVG içeriğiniz */}
                  <ellipse cx="256" cy="480" rx="30" ry="8" fill="rgba(0,0,0,0.2)" />
                  
                  <path 
                    fill="#D5DEE4" 
                    d="M256 504.575c-13.382 0-18.231-10.848-18.231-24.23l-6-323.28c0-13.382 10.848-24.23 24.23-24.23s24.23 10.848 24.23 24.23l-6 323.28c.001 13.382-4.847 24.23-18.229 24.23z"
                  />
                  
                  <path 
                    fill="#BCCBD3" 
                    d="M256 132.834c-13.382 0-24.23 10.848-24.23 24.23l1.752 94.386C240.745 253.119 248.27 254 256 254s15.255-.881 22.479-2.549l1.752-94.386c-.001-13.382-10.849-24.231-24.231-24.231z"
                  />
                  
                  <circle 
                    cx="256" 
                    cy="112" 
                    r="111" 
                    fill={marker.color} 
                    stroke="#ffffff"
                    strokeWidth="4"
                  />
                  
                  <ellipse 
                    transform="rotate(33.488 194.39 60.752)" 
                    fill="#FFFFFF" 
                    fillOpacity="0.5"
                    cx="194.399" 
                    cy="60.749" 
                    rx="19.076" 
                    ry="32.428"
                  />
                </svg>
              </g>
            </Marker>
          ))}

          </ZoomableGroup>
        </ComposableMap>
        <ReactTooltip id="mro-city-tooltip" place="top" effect="solid" style={{ backgroundColor: '#334155', color: 'white', fontSize: '0.8rem', padding: '4px 8px' }} />
      </div>
    </div>
  );
};

export default MROWorldMap;