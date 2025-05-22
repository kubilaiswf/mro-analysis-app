export const cityCoordinates = {
  // Mevcut koordinatlar
  "Montreal": { lat: 45.5017, lng: -73.5673 },
  "London": { lat: 51.5074, lng: -0.1278 },
  "Budapest": { lat: 47.4979, lng: 19.0402 },
  "Bucharest": { lat: 44.4268, lng: 26.1025 },
  "Beijing": { lat: 39.9042, lng: 116.4074 },
  "Leipzig": { lat: 51.3397, lng: 12.3731 },
  "Leipzig/Halle": { lat: 51.3397, lng: 12.3731 },
  "Frankfurt": { lat: 50.1109, lng: 8.6821 },
  "East Midlands": { lat: 52.8311, lng: -1.3321 },
  "Tel Aviv": { lat: 32.0853, lng: 35.03 },
  "Ben": { lat: 32.0853, lng: 34.7818 },
  "Larnaca": { lat: 34.9002, lng: 33.6232 },
  "Athens": { lat: 37.9838, lng: 23.7275 },
  "Naples": { lat: 40.8518, lng: 14.2681 },
  "Rome": { lat: 41.9028, lng: 12.4964 },
  "Olbia": { lat: 40.9239, lng: 9.4994 },
  "Cardiff": { lat: 51.4816, lng: -3.1791 },
  "Miami": { lat: 25.7617, lng: -80.1918 },
  "Dothan": { lat: 31.2232, lng: -85.4013 },
  "Kelowna": { lat: 49.8880, lng: -119.4960 },
  "Jinan": { lat: 36.6512, lng: 117.1201 },
  "Xiamen": { lat: 24.4798, lng: 118.0819 },
  "Haikou": { lat: 20.0440, lng: 110.3240 },
  "Shannon": { lat: 52.6996, lng: -8.9168 },
  "Abu Dhabi": { lat: 24, lng: 54.5773 },
  "Addis Ababa": { lat: 9.0320, lng: 38.7490 },
  "Cincinnati": { lat: 39.1031, lng: -84.5120 },
  "CVG": { lat: 39.0489, lng: -84.6678 },
  
  "Atlanta": { lat: 33.7490, lng: -84.3880 },
  "Amsterdam": { lat: 52.3676, lng: 4.9041 },
  "Bacău": { lat: 46.5670, lng: 26.9150 },
  "Delhi": { lat: 28.6139, lng: 77.2090 },
  "Indira": { lat: 28.5561, lng: 77.0998 }, // Indira Gandhi Uluslararası Havalimanı
  "Tampa": { lat: 27.9506, lng: -82.4572 },
  "Abbotsford": { lat: 49.0504, lng: -122.3045 },
  "Ontario": { lat: 34.0633, lng: -117.6509 }, // California, USA
  "Juan": { lat: 9.9981, lng: -84.2041 }, // Juan Santamaría Uluslararası Havalimanı
  "Kahire": { lat: 30.0444, lng: 31.2357 },
  "Dresden": { lat: 51.0504, lng: 13.7373 },
  "Dublin": { lat: 53.3498, lng: -6.2603 },
  "Varna": { lat: 43.2141, lng: 27.9147 },
  "St. Petersburg": { lat: 59.9343, lng: 30.3351 },
  "Kenya": { lat: -1.2921, lng: 36.8219 }, // Kenya'nın başkenti
  "Incheon": { lat: 37.4563, lng: 126.7052 },
  "Norwich": { lat: 52.6309, lng: 1.2974 },
  "Varşova": { lat: 52.2297, lng: 21.0122 },
  "Almanya": { lat: 51.1657, lng: 10.4515 }, // Almanya'nın merkezi
  "Hamburg": { lat: 53.5511, lng: 9.9937 }, // Lufthansa Technik merkezi
  
  "Hong Kong": { lat: 22.3193, lng: 114.1694 }, // CASL için
  "Phoenix": { lat: 33.4484, lng: -112.0740 }, // Aerospace Rotables için (varsayılan)

  "San Jose": { lat: 9.9281, lng: -84.0907 }, // Costa Rica'nın başkenti
  "Cairo": { lat: 30.0444, lng: 31.2357 }, // Mısır'ın başkenti
  "Moscow": { lat: 55.7558, lng: 37.6173 }, // Rusya'nın başkenti
  "Nairobi": { lat: -1.2921, lng: 36.8219 }, // Kenya'nın başkenti
  "Warsaw": { lat: 52.2297, lng: 21.0122 }, // Polonya'nın başkenti
  "St. Petersburg": { lat: 59.9343, lng: 30.3351 }, // Rusya'nın ikinci büyük şehri
  "Lasham": { lat: 51.185667, lng: -1.033500 },
  "Vantaa": { lat: 60.317000, lng: 24.958000 },
  "Wood Dale": { lat: 41.9719, lng: -87.9757 },  // AAR Corp headquarters
  "Ljubljana": { lat: 46.223, lng: 14.455 },  // Adria Tehnika location
  "Everett": { lat: 47.9790, lng: -122.2021 },  // ATS headquarters at Paine Field
  "Madrid": { lat: 40.4168, lng: -3.7038 },  // Iberia Maintenance headquarters
  "Jakarta": { lat: -6.2088, lng: 106.8456 },  // GMF AeroAsia headquarters
  "Xiamen": { lat: 24.4798, lng: 118.0819 },  // HAECO Group location
  "Oklahoma City": { lat: 35.4676, lng: -97.5164 }, // AAR Corp. Oklahoma City için eklendi
  "Oklahoma": { lat: 35.4676, lng: -97.5164 } // AAR Corp. Oklahoma City için alternatif anahtar
}

// MRO şirketleri için renkler - her şirket için benzersiz bir renk
export const mroColors = {
  // Mevcut renkler
  "AJW Technique": "#FF5733",
  "Aeroplex of Central Europe": "#33FF57",
  "Ameco Beijing": "#3357FF",
  "AMTES GmbH": "#FF33A8",
  "BCT Aviation Maintenance": "#33FFF6",
  "Bedek - IAI": "#FFD133",
  "Bird Aviation": "#8C33FF",
  "Atitech S.p.A.": "#FF3333",
  "AerFin": "#33FFBD",
  "Apella S.A.": "#5DFF33",
  "Atlantic Aviation Group": "#FF8C33",
  "Ethiopian MRO": "#337DFF",
  "Etihad Engineering": "#B333FF",
  "AEI Aeronautical Engineers, Inc.": "#33FF3C",
  "FEAM Maintenance/Engineering": "#F08080",
  
  // Yeni MRO'lar için renkler
  "Aerospace Rotables": "#6A5ACD",
  "Aerostar S.A.": "#20B2AA",
  "AI Engineering Services Limited (AIESL)": "#FF6347",
  "Air Works": "#FFD700",
  "Airborne Maintenance & Engineering Services (AMES)": "#7B68EE",
  "Cascade Aerospace": "#FF4500",
  "Certified Aviation Services (CAS)": "#00FA9A",
  "China Aircraft Services Limited (CASL)": "#800000",
  "COOPESA R.L. (Cooperativa Autogestionaria de Servicios Aeroindustriales)": "#9370DB",
  "Delta TechOps": "#4169E1",
  "Magnetic Line (Direct Maintenance)": "#808000",
  "Egyptair Maintenance & Engineering (EGME)": "#DC143C",
  "EFW (Elbe Flugzeugwerke GmbH)": "#008B8B",
  "Dublin Aerospace Group": "#006400",
  "ETG Maintenance (Elektra Trans Global)": "#A0522D",
  "S7 Technics": "#6B8E23",
  "KQ MRO (Kenya Airways MRO)": "#BC8F8F",
  "Korean Air Maintenance and Engineering": "#483D8B",
  "KLM UK Engineering Limited MRO": "#4682B4",
  "LOT Aircraft Maintenance Services (LOTAMS)": "#663399",
  "Lufthansa Technik AG": "#2E8B57",
  "2Excel Engineering Ltd": "#FFC300",
  "GA Telesis Engine Services (GATES)": "#DAF7A6",
  "AAR Corp": "#3498DB", // AAR Corp mavi
  "Adria Tehnika": "#E74C3C", // Adria Tehnika kırmızı
  "Aviation Technical Services (ATS)": "#FF9800", // Turuncu
  "Iberia Maintenance": "#E81F30", // Iberia kırmızı
  "GMF AeroAsia (PT Garuda Maintenance Facility Aero Asia Tbk)": "#0A9447", // Yeşil (Garuda rengi)
  "HAECO Group (Hong Kong Aircraft Engineering Company Limited)": "#002A5C" // Lacivert
};

// Şehirler ile MRO şirketleri arasındaki eşleştirme
export const cityToMroMapping = {
  "Montreal": "AJW Technique",
  "London": "AJW Technique",
  "Budapest": "Aeroplex of Central Europe",
  "Bucharest": "Aeroplex of Central Europe",
  "Beijing": "Ameco Beijing",
  "Leipzig": "AMTES GmbH",
  "Leipzig/Halle": "AMTES GmbH", // Eklendi
  "Frankfurt": "AMTES GmbH",
  "East Midlands": "BCT Aviation Maintenance",
  "Tel Aviv": "Bedek - IAI",
  "Ben": "Bedek - IAI", // Eklendi
  "Larnaca": "Bird Aviation",
  "Athens": "Apella S.A.",
  "Naples": "Atitech S.p.A.",
  "Rome": "Atitech S.p.A.",
  "Olbia": "Atitech S.p.A.",
  "Cardiff": "AerFin",
  "Miami": "AEI Aeronautical Engineers",
  "Dothan": "AEI Aeronautical Engineers",
  "Kelowna": "AEI Aeronautical Engineers",
  "Jinan": "AEI Aeronautical Engineers", 
  "Xiamen": "AEI Aeronautical Engineers",
  "Haikou": "AEI Aeronautical Engineers",
  "Shannon": "Atlantic Aviation Group",
  "Abu Dhabi": "Etihad Engineering",
  "Addis Ababa": "Ethiopian MRO",
  "Cincinnati": "FEAM Maintenance/Engineering", // Eklendi
  "CVG": "FEAM Maintenance/Engineering", // Eklendi
  "Phoenix": "Aerospace Rotables", 
  "Bacău": "Aerostar S.A.",
  "Delhi": "AI Engineering Services Limited (AIESL)",
  "Tampa": "Airborne Maintenance & Engineering Services (AMES)",
  "Abbotsford": "Cascade Aerospace",
  "Ontario": "Certified Aviation Services (CAS)",
  "Hong Kong": "China Aircraft Services Limited (CASL)",
  "San Jose": "COOPESA R.L. (Cooperativa Autogestionaria de Servicios Aeroindustriales)",
  "Atlanta": "Delta TechOps",
  "Amsterdam": "Magnetic Line (Direct Maintenance)",
  "Cairo": "Egyptair Maintenance & Engineering (EGME)",
  "Dresden": "EFW (Elbe Flugzeugwerke GmbH)",
  "Dublin": "Dublin Aerospace Group",
  "Varna": "ETG Maintenance (Elektra Trans Global)",
  "Moscow": "S7 Technics",
  "Nairobi": "KQ MRO (Kenya Airways MRO)",
  "Incheon": "Korean Air Maintenance and Engineering",
  "Norwich": "KLM UK Engineering Limited MRO",
  "Warsaw": "LOT Aircraft Maintenance Services (LOTAMS)",
  "Hamburg": "Lufthansa Technik AG",
  "Lasham": "2Excel Engineering Ltd",
  "Vantaa": "GA Telesis Engine Services (GATES)",
  "Wood Dale": "AAR Corp", // Wood Dale AAR Corp merkezi olarak kalabilir.
  "Oklahoma City": "AAR Corp", // Oklahoma City'de de bir tesisleri varsa ekleyebiliriz.
  "Oklahoma": "AAR Corp", // Alternatif anahtar
  "Ljubljana": "Adria Tehnika",
  "Everett": "Aviation Technical Services (ATS)",
  "Madrid": "Iberia Maintenance",
  "Jakarta": "GMF AeroAsia (PT Garuda Maintenance Facility Aero Asia Tbk)",
  "Xiamen": "HAECO Group (Hong Kong Aircraft Engineering Company Limited)"
};