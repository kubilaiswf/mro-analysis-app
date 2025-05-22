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
  "Phoenix": "USA",
  "Lasham": "United Kingdom",
  "Vantaa": "Finland",
  "Wood Dale": "USA",
  "Ljubljana": "Slovenia",
  "Everett": "USA",
  "Madrid": "Spain",
  "Jakarta": "Indonesia",
  "Xiamen": "China"
};

// Ülke-kıta eşleşmesi (Genişletilmiş)
// Not: Buradaki ülke adları, world-atlas geojson dosyasındaki 'properties.name' ile eşleşmelidir.
const countryToContinentMapping = {
  // North America
  "Canada": "North America",
  "United States of America": "North America", // "USA" yerine tam ad
  "Mexico": "North America",
  "Greenland": "North America",
  "Guatemala": "North America",
  "Cuba": "North America",
  "Haiti": "North America",
  "Dominican Republic": "North America",
  "Honduras": "North America",
  "Nicaragua": "North America",
  "El Salvador": "North America",
  "Costa Rica": "North America",
  "Panama": "North America",
  "Jamaica": "North America",
  "Puerto Rico": "North America",
  "Trinidad and Tobago": "North America",
  "Belize": "North America",
  "Bahamas": "North America",

  // South America
  "Brazil": "South America",
  "Argentina": "South America",
  "Colombia": "South America",
  "Peru": "South America",
  "Venezuela": "South America",
  "Chile": "South America",
  "Ecuador": "South America",
  "Bolivia": "South America",
  "Paraguay": "South America",
  "Uruguay": "South America",
  "Guyana": "South America",
  "Suriname": "South America",
  "French Guiana": "South America",

  // Europe
  "Germany": "Europe",
  "United Kingdom": "Europe",
  "France": "Europe",
  "Italy": "Europe",
  "Spain": "Europe",
  "Ukraine": "Europe",
  "Poland": "Europe",
  "Romania": "Europe",
  "Netherlands": "Europe",
  "Belgium": "Europe",
  "Czech Republic": "Europe", // Czechia olarak da geçebilir, kontrol et
  "Czechia": "Europe", // Alternatif isim eklendi
  "Greece": "Europe",
  "Portugal": "Europe",
  "Sweden": "Europe",
  "Hungary": "Europe",
  "Belarus": "Europe",
  "Austria": "Europe",
  "Switzerland": "Europe",
  "Bulgaria": "Europe",
  "Denmark": "Europe",
  "Finland": "Europe",
  "Slovakia": "Europe",
  "Norway": "Europe",
  "Ireland": "Europe",
  "Croatia": "Europe",
  "Moldova": "Europe",
  "Bosnia and Herzegovina": "Europe",
  "Albania": "Europe",
  "Lithuania": "Europe",
  "North Macedonia": "Europe",
  "Slovenia": "Europe",
  "Latvia": "Europe",
  "Estonia": "Europe",
  "Montenegro": "Europe",
  "Luxembourg": "Europe",
  "Malta": "Europe",
  "Iceland": "Europe",
  "Cyprus": "Europe", 
  "Russia": "Europe",
  "Turkey": "Europe",
  "Serbia": "Europe",
  "Kosovo": "Europe",
  "Republic of Kosovo": "Europe",
  "Vatican City": "Europe",
  "Holy See": "Europe",
  "San Marino": "Europe",
  "Liechtenstein": "Europe",
  "Andorra": "Europe",
  "Monaco": "Europe",
  "Isle of Man": "Europe",
  "Faroe Islands": "Europe",
  "Gibraltar": "Europe",
  "Svalbard and Jan Mayen": "Europe",
  "Åland Islands": "Europe",
  "Aland Islands": "Europe",

  // Asia
  "China": "Asia",
  "India": "Asia",
  "Indonesia": "Asia",
  "Pakistan": "Asia",
  "Bangladesh": "Asia",
  "Japan": "Asia",
  "Philippines": "Asia",
  "Vietnam": "Asia",
  "Iran": "Asia",
  "Thailand": "Asia",
  "Myanmar": "Asia",
  "South Korea": "Asia",
  "Iraq": "Asia",
  "Afghanistan": "Asia",
  "Saudi Arabia": "Asia",
  "Uzbekistan": "Asia",
  "Malaysia": "Asia",
  "Yemen": "Asia",
  "Nepal": "Asia",
  "North Korea": "Asia",
  "Syria": "Asia",
  "Sri Lanka": "Asia",
  "Jordan": "Asia",
  "Azerbaijan": "Asia", // Bir kısmı Avrupa'da
  "United Arab Emirates": "Asia", // UAE
  "Tajikistan": "Asia",
  "Israel": "Asia",
  "Hong Kong": "Asia",
  "Laos": "Asia",
  "Lebanon": "Asia",
  "Kyrgyzstan": "Asia",
  "Turkmenistan": "Asia",
  "Singapore": "Asia",
  "Oman": "Asia",
  "State of Palestine": "Asia",
  "Kuwait": "Asia",
  "Georgia": "Asia", // Bir kısmı Avrupa'da
  "Mongolia": "Asia",
  "Armenia": "Asia", // Bir kısmı Avrupa'da
  "Qatar": "Asia",
  "Bahrain": "Asia",
  "Timor-Leste": "Asia",
  "Bhutan": "Asia",
  "Macau": "Asia",
  "Brunei Darussalam": "Asia", // Brunei

  // Africa
  "Nigeria": "Africa",
  "Ethiopia": "Africa",
  "Egypt": "Africa",
  "Democratic Republic of the Congo": "Africa",
  "DR Congo": "Africa",
  "Congo-Kinshasa": "Africa", // Alternatif isim
  "Congo, the Democratic Republic of the": "Africa",
  "Congo, Democratic Republic of the": "Africa",
  "Tanzania": "Africa",
  "Tanzania, United Republic of": "Africa",
  "United Republic of Tanzania": "Africa",
  "South Africa": "Africa",
  "Republic of South Africa": "Africa",
  "Kenya": "Africa",
  "Uganda": "Africa",
  "Algeria": "Africa",
  "People's Democratic Republic of Algeria": "Africa",
  "Sudan": "Africa",
  "Republic of the Sudan": "Africa",
  "Morocco": "Africa",
  "Kingdom of Morocco": "Africa",
  "Angola": "Africa",
  "Mozambique": "Africa",
  "Ghana": "Africa",
  "Madagascar": "Africa",
  "Republic of Madagascar": "Africa",
  "Cameroon": "Africa",
  "Republic of Cameroon": "Africa",
  "Côte d'Ivoire": "Africa",
  "Cote d'Ivoire": "Africa",
  "Ivory Coast": "Africa",
  "Republic of Côte d'Ivoire": "Africa", 
  "Niger": "Africa",
  "Republic of Niger": "Africa",
  "Burkina Faso": "Africa",
  "Mali": "Africa",
  "Republic of Mali": "Africa",
  "Malawi": "Africa",
  "Republic of Malawi": "Africa",
  "Zambia": "Africa",
  "Republic of Zambia": "Africa",
  "Senegal": "Africa",
  "Republic of Senegal": "Africa",
  "Chad": "Africa",
  "Republic of Chad": "Africa",
  "Tchad": "Africa", // Fransızca ismi
  "Somalia": "Africa",
  "Federal Republic of Somalia": "Africa",
  "Zimbabwe": "Africa",
  "Republic of Zimbabwe": "Africa",
  "Guinea": "Africa",
  "Republic of Guinea": "Africa",
  "Rwanda": "Africa",
  "Republic of Rwanda": "Africa", 
  "Benin": "Africa",
  "Republic of Benin": "Africa",
  "Burundi": "Africa",
  "Republic of Burundi": "Africa",
  "Tunisia": "Africa",
  "Republic of Tunisia": "Africa",
  "South Sudan": "Africa",
  "Republic of South Sudan": "Africa",
  "S. Sudan": "Africa", 
  "S Sudan": "Africa", 
  "Republic of S. Sudan": "Africa",
  "S. Sudan, Republic of": "Africa",

  "Central African Republic": "Africa",
  "C.A.R.": "Africa", 
  "CAR": "Africa",
  "Central African Rep.": "Africa",
  "Cent. Afr. Republic": "Africa",
  "Central Africa": "Africa",

  "Democratic Republic of the Congo": "Africa",
  "Democratic Republic of Congo": "Africa",
  "DR Congo": "Africa",
  "D.R. Congo": "Africa",
  "DRC": "Africa",
  "Dem. Rep. Congo": "Africa",
  "Dem. Congo": "Africa",
  "Congo, Democratic": "Africa",
  "Congo, Dem. Rep.": "Africa", 
  "Congo, Democratic Republic of": "Africa",
  "Congo, Democratic Republic of the": "Africa",
  "Congo Democratic Republic": "Africa",
  "Congo (Democratic)": "Africa",
  "DROC": "Africa",
  "Congo-Kinshasa": "Africa",
  "Kinshasa": "Africa",
  "Zaire": "Africa", // Eski ismi

  "Togo": "Africa",
  "Togolese Republic": "Africa", 
  "Sierra Leone": "Africa",
  "Republic of Sierra Leone": "Africa",
  "Libya": "Africa",
  "State of Libya": "Africa",
  "Republic of the Congo": "Africa",
  "Congo": "Africa",
  "Congo Republic": "Africa",
  "Congo-Brazzaville": "Africa",
  "Congo, Republic of the": "Africa",
  "Republic of Congo": "Africa",
  "Liberia": "Africa",
  "Republic of Liberia": "Africa",
  "Central African Republic": "Africa",
  "CAR": "Africa", 
  "Mauritania": "Africa",
  "Islamic Republic of Mauritania": "Africa",
  "Eritrea": "Africa",
  "State of Eritrea": "Africa",
  "Namibia": "Africa",
  "Republic of Namibia": "Africa",
  "Gambia": "Africa", 
  "The Gambia": "Africa",
  "Republic of the Gambia": "Africa",
  "Botswana": "Africa",
  "Republic of Botswana": "Africa",
  "Gabon": "Africa",
  "Gabonese Republic": "Africa",
  "Republic of Gabon": "Africa",
  "Lesotho": "Africa",
  "Kingdom of Lesotho": "Africa",
  "Guinea-Bissau": "Africa",
  "Republic of Guinea-Bissau": "Africa",
  "Equatorial Guinea": "Africa",
  "Republic of Equatorial Guinea": "Africa",
  "Mauritius": "Africa",
  "Republic of Mauritius": "Africa",
  "Eswatini": "Africa",
  "Kingdom of Eswatini": "Africa",
  "Swaziland": "Africa",
  "Kingdom of Swaziland": "Africa",
  "Djibouti": "Africa",
  "Republic of Djibouti": "Africa",
  "Comoros": "Africa",
  "Union of the Comoros": "Africa",
  "Cabo Verde": "Africa",
  "Cape Verde": "Africa",
  "Republic of Cabo Verde": "Africa", 
  "Sao Tome and Principe": "Africa",
  "São Tomé and Príncipe": "Africa",
  "Democratic Republic of São Tomé and Príncipe": "Africa",
  "Seychelles": "Africa",
  "Republic of Seychelles": "Africa",
  "Western Sahara": "Africa",
  "SADR": "Africa", // Sahra Arap Demokratik Cumhuriyeti kısaltması
  "Somaliland": "Africa", 
  "Réunion": "Africa",
  "Reunion": "Africa",
  "Mayotte": "Africa",
  "Saint Helena": "Africa",
  "Saint Helena, Ascension and Tristan da Cunha": "Africa",

  // Oceania
  "Australia": "Oceania",
  "Papua New Guinea": "Oceania",
  "New Zealand": "Oceania",
  "Fiji": "Oceania",
  "Solomon Islands": "Oceania",
  "Vanuatu": "Oceania",
  "New Caledonia": "Oceania", // Fransa'ya bağlı, kontrol etmelisin GeoJSON'da nasıl geçtiğini
  "Samoa": "Oceania",
  "Kiribati": "Oceania",
  "Micronesia": "Oceania",
  "Tonga": "Oceania",
  "Marshall Islands": "Oceania",
  "Palau": "Oceania",
  "Tuvalu": "Oceania",
  "Nauru": "Oceania",

  // Balkan ülkelerinin tüm olası varyasyonları
  "Macedonia": "Europe", 
  "Republic of Macedonia": "Europe",
  "Former Yugoslav Republic of Macedonia": "Europe",
  "FYROM": "Europe",
  "North Macedonia": "Europe", // Yeni resmi adı
  "Republic of North Macedonia": "Europe",
  "Macedonia, North": "Europe",
  "Macedonia, Republic of": "Europe",
  
  "Bosnia and Herzegovina": "Europe",
  "Bosnia & Herzegovina": "Europe", 
  "Bosnia-Herzegovina": "Europe",
  "Bosnia": "Europe",
  "Herzegovina": "Europe",
  "BiH": "Europe",
  "Federation of Bosnia and Herzegovina": "Europe",
  "Bosnia and Herzegovina, Federation of": "Europe",
  
  "Montenegro": "Europe",
  "Republic of Montenegro": "Europe",
  "Crna Gora": "Europe", // Yerel ismi
  
  "Croatia": "Europe",
  "Republic of Croatia": "Europe",
  "Hrvatska": "Europe", // Yerel ismi
  
  "Slovenia": "Europe", 
  "Republic of Slovenia": "Europe",
  "Slovenija": "Europe", // Yerel ismi
  
  "Albania": "Europe",
  "Republic of Albania": "Europe", 
  "Shqipëria": "Europe", // Yerel ismi
  
  "Serbia": "Europe",
  "Republic of Serbia": "Europe",
  "Srbija": "Europe", // Yerel ismi
  
  "Bulgaria": "Europe",
  "Republic of Bulgaria": "Europe",
  "Balgariya": "Europe", // Yerel ismi
  
  "Romania": "Europe", 
  "Republic of Romania": "Europe",
  "România": "Europe", // Yerel ismi
  
  "Moldova": "Europe",
  "Republic of Moldova": "Europe",
  "Moldova, Republic of": "Europe",
};

const continentFocusSettings = {
  "Asia": { center: [90, 25], zoom: 2.8 },
  "Europe": { center: [15, 50], zoom: 3.5 },
  "Africa": { center: [20, 0], zoom: 2.8 },
  "North America": { center: [-100, 40], zoom: 2.8 },
  "South America": { center: [-60, -20], zoom: 2.8 },
  "Oceania": { center: [135, -25], zoom: 3 },
  "Default": { center: [10, 0], zoom: 1 }, // Dünya geneli için
};

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// MROWorldMap.jsx içindeki countryCoordinates ve mroColors array'ini kaldırın,
// çünkü bunları cityCoordinates.js'den alacağız.

const MROWorldMap = ({ continent }) => {
  const navigate = useNavigate();
  const [activeMarker, setActiveMarker] = useState(null);
  const [tooltipContent, setTooltipContent] = useState("");
  const [error, setError] = useState(null);
  const [worldGeoData, setWorldGeoData] = useState(null);

  // Dünya haritası verisini yükle
  useEffect(() => {
    fetch(geoUrl)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setWorldGeoData(data);
      })
      .catch(err => {
        console.error("Dünya harita verisi yüklenemedi:", err);
        setError("Harita altlığı yüklenirken bir sorun oluştu.");
      });
  }, []);

  const currentFocus = continent && continentFocusSettings[continent] 
    ? continentFocusSettings[continent] 
    : continentFocusSettings["Default"];

  // Kıtaya göre filtrelenmiş harita verisi
  const filteredGeoData = useMemo(() => {
    if (!worldGeoData) return null; // Ana veri yüklenmediyse null dön
    if (!continent) return worldGeoData; // Kıta belirtilmemişse tüm dünyayı göster

    // TopoJSON formatında ülkeleri filtrele
    // HATA AYIKLAMA: Tüm obje anahtarlarını logla
    console.log("worldGeoData objects:", Object.keys(worldGeoData.objects));
    
    // world-atlas genellikle 'countries' veya 'countries1' veya 'ne_110m_admin_0_countries' adlı bir nesne içerir
    // Doğru anahtarı bulmaya çalışalım
    let countryObjectKey = null;
    if (worldGeoData.objects.countries) {
      countryObjectKey = 'countries';
    } else if (worldGeoData.objects.countries1) {
      countryObjectKey = 'countries1';
    } else if (worldGeoData.objects.ne_110m_admin_0_countries) {
      countryObjectKey = 'ne_110m_admin_0_countries';
    } else {
      // Başka bir anahtar bulmaya çalışalım
      for (const key of Object.keys(worldGeoData.objects)) {
        if (key.includes('countr') || key.includes('admin')) {
          countryObjectKey = key;
          break;
        }
      }
    }
    
    if (!countryObjectKey) {
      console.warn("TopoJSON'da ülkeler nesnesi bulunamadı, ilk anahtarı kullanıyoruz");
      countryObjectKey = Object.keys(worldGeoData.objects)[0];
    }
    
    console.log("Kullanılan ülke nesnesi anahtarı:", countryObjectKey);
    
    const countries = worldGeoData.objects[countryObjectKey]; 
    if (!countries || !countries.geometries) {
      console.warn("TopoJSON formatı beklenenden farklı veya ülkeler objesi bulunamadı.");
      return worldGeoData;
    }
    
    // HATA AYIKLAMA: Afrika ülkelerini ve bulunamayanları izle
    const allCountryNames = countries.geometries
      .map(geo => geo.properties && geo.properties.name)
      .filter(Boolean);
    
    console.log("Tüm ülke isimleri:", allCountryNames);

    if (continent === "Africa") {
      // Afrika'daki sorunlu ülkeleri özel olarak kontrol et
      const specialCountries = ["South Sudan", "Central African Republic", "Democratic Republic of the Congo", 
                               "Dem. Rep. Congo", "Central African Rep.", "S. Sudan", "Republic of South Sudan",
                               "Congo-Kinshasa", "Congo, Democratic Republic of", "DR Congo"];
      
      for (const specialCountry of specialCountries) {
        const found = countries.geometries
          .some(geo => geo.properties && geo.properties.name === specialCountry);
        
        console.log(`"${specialCountry}" GeoJSON'da ${found ? 'BULUNDU' : 'BULUNAMADI'}`);
      }
    }

    const featuresForContinent = countries.geometries.filter(geo => {
      const countryName = geo.properties && geo.properties.name;
      if (!countryName) return false;
      
      const countryContinent = countryToContinentMapping[countryName];
      
      // HATA AYIKLAMA: İlgilendiğimiz ülkeleri ve eşleşme durumlarını logla
      const isSpecialCountry = ["South Sudan", "Central African Republic", "Democratic Republic of the Congo",
                                "Congo-Kinshasa", "Congo-Brazzaville"].includes(countryName);
      if (isSpecialCountry || (!countryContinent && continent === "Africa")) {
        console.log(`Ülke: "${countryName}" -> Kıta eşlemesi: ${countryContinent || "YOK!"}`);
      }
      
      return countryContinent === continent;
    });

    if (featuresForContinent.length === 0 && continent) {
      // Bu kıta için ülke bulunamadıysa (mapping eksik olabilir), yine de bir şeyler göstermeye çalışabiliriz
      // veya boş bir harita göstermek yerine tüm dünyayı gösterebiliriz.
      // Şimdilik, eğer kıta filtresi aktifse ve sonuç yoksa, boş bir geometri koleksiyonu gösterelim.
      // Bu, haritanın boş görünmesini sağlar ama en azından hata vermez.
      console.warn(`'${continent}' kıtası için eşleşen ülke bulunamadı. countryToContinentMapping'i kontrol edin.`);
    }
    
    // Yeni bir TopoJSON nesnesi oluştur, sadece filtrelenmiş ülkeleri içersin
    // Arcs (arklar) ve transform gibi diğer TopoJSON özelliklerini koru
    return {
      type: "Topology",
      arcs: worldGeoData.arcs,
      transform: worldGeoData.transform, // Eğer varsa
      objects: {
        // Orijinal TopoJSON'daki anahtar genellikle 'countries' veya bazen dosya adıdır.
        // 'countries-110m.json' için 'countries' olmalı.
        // Eğer farklı bir anahtar kullanılıyorsa (örn: worldGeoData.objects'in ilk anahtarı) dinamik yapılabilir.
        // Şimdilik 'countries' varsayıyoruz.
        countries: { 
          type: "GeometryCollection",
          geometries: featuresForContinent
        }
        // Eğer dünya haritasında 'land' gibi başka katmanlar varsa ve
        // onları da kıtaya göre filtrelemek/göstermek istemiyorsak burada ayrıca ele almalıyız.
        // Şimdilik sadece ülkeleri filtreliyoruz.
      }
    };
  }, [worldGeoData, continent]);

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
      "2Excel Engineering Ltd": "Lasham",
      "GA Telesis Engine Services (GATES)": "Vantaa",
      "AAR Corp": "Wood Dale",
      "Adria Tehnika": "Ljubljana",
      "Aviation Technical Services (ATS)": "Everett",
      "Iberia Maintenance": "Madrid",
      "GMF AeroAsia (PT Garuda Maintenance Facility Aero Asia Tbk)": "Jakarta",
      "HAECO Group (Hong Kong Aircraft Engineering Company Limited)": "Xiamen",
      
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
              "nairobi": "Nairobi",
              "lasham": "Lasham",
              "vantaa": "Vantaa",
              "wood dale": "Wood Dale",
              "ljubljana": "Ljubljana",
              "everett": "Everett",
              "paine field": "Everett",
              "madrid": "Madrid",
              "jakarta": "Jakarta",
              "xiamen": "Xiamen"
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
        const mroContinent = countryToContinentMapping[country] || "Unknown"; // Kıta bilgisi eklendi

        return {
          mroIndex: index, // Detay sayfasına yönlendirme için
          name: mro.mroFirmasiAdi,
          city,
          country, // Ülke bilgisini ekledik
          continent: mroContinent, // Kıta bilgisi eklendi
          coordinates: [cityData.lng, cityData.lat], // react-simple-maps [lng, lat] bekler
          color,
        };
      })
      .filter(Boolean) // Null olanları filtrele
      .filter(marker => { // Kıta filtresi
        if (!continent) return true; // Eğer kıta prop'u yoksa tümünü göster
        return marker.continent === continent;
      });
  }, [mroFirmalari, continent]); // continent bağımlılığı eklendi

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

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-red-100 rounded-xl p-4 border border-red-300">
        <p className="text-red-700 font-medium text-center">Harita Yüklenemedi: {error}</p>
      </div>
    );
  }
  
  // filteredGeoData yüklenene kadar bir yükleme göstergesi eklenebilir
  if (!filteredGeoData && !error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-700 rounded-lg">
        <p className="text-gray-400">Harita yükleniyor...</p>
      </div>
    );
  }
  
  // Eğer filtrelenmiş veri var ama içinde hiç geometri yoksa (yani kıta için ülke bulunamadı)
  // ve bir kıta filtresi aktifse özel bir mesaj gösterilebilir.
  if (continent && filteredGeoData && filteredGeoData.objects.countries.geometries.length === 0 && !error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-700 rounded-lg">
        <p className="text-center text-gray-400 p-4">
          '{continent}' kıtası için harita verisi bulunamadı.<br/>
          Ülke eşleştirmelerini kontrol edin veya bu kıtada gösterilecek ülke olmayabilir.
        </p>
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
    <div className="h-[600px] bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      {/* Harita Alanı */}
      <div className="h-full relative">
        {mroCityMarkers.length === 0 && !error && continent && ( // Sadece kıta filtresi aktifken göster
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <p className="text-gray-300 bg-gray-900 bg-opacity-75 p-3 rounded text-sm shadow-lg">
              {`${continent} kıtasında gösterilecek MRO merkezi bulunamadı.`}
            </p>
          </div>
        )}
        {/* Harita Alanı: filteredGeoData null değilse ve hata yoksa göster */}
        {filteredGeoData && !error && (
          <ComposableMap 
            projection="geoMercator" 
            style={{ width: "100%", height: "100%" }}
            projectionConfig={{
                rotate: currentFocus.rotate || [0, 0, 0], // Gerekirse döndürme ayarı
                scale: currentFocus.scale || 150 // Ölçek ayarı, dinamik olabilir
            }}
            >
            <ZoomableGroup center={currentFocus.center} zoom={currentFocus.zoom}>
              <Geographies geography={filteredGeoData} /* Filtrelenmiş veriyi kullan */ >
                {({ geographies }) =>
                  geographies.map(geo => {
                    // geo.properties.name ile countryToContinentMapping[geo.properties.name] === continent
                    // kontrolü ile sadece o kıtanın ülkelerini boyayabiliriz,
                    // ama zaten filteredGeoData sadece o kıtanın ülkelerini içermeli.
                    // Eğer farklı bir renklendirme isteniyorsa burada yapılabilir.
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#374151" 
                        stroke="#4B5563" 
                        style={{
                          default: { outline: "none" },
                          hover: { fill: "#4B5563", outline: "none" },
                          pressed: { fill: "#2b3440", outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {/* Artık tüm MRO'ları gösteriyoruz, filtre kaldırıldı */}
              {mroCityMarkers.map(marker => (
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
        )}
        <ReactTooltip id="mro-city-tooltip" place="top" effect="solid" style={{ backgroundColor: '#334155', color: 'white', fontSize: '0.8rem', padding: '4px 8px' }} />
      </div>
    </div>
  );
};

export default MROWorldMap;