import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import continentInfoData from '../data/continentInfo.json';
import { 
    FaArrowLeft, FaGlobeEurope, FaChartBar, FaUsers, FaIndustry, 
    FaPlaneDeparture, FaMoneyBillWave, FaListAlt, FaInfoCircle,
    FaChartLine, FaFileAlt, FaBuilding, FaTools, FaDollarSign, FaPercentage, FaSortAmountUp, FaHourglassHalf, FaUserTie, FaClipboardList, FaPaperPlane, FaLightbulb
} from 'react-icons/fa';

// Bu mapping ContinentMap.jsx'teki ile aynı olmalı
const continentNameMapping = {
  "North America": "Kuzey Amerika",
  "South America": "Güney Amerika",
  "Europe": "Avrupa",
  "Africa": "Afrika",
  "Asia": "Asya-Pasifik",
  "Oceania": "Okyanusya"
};

// Başlıkları daha kullanıcı dostu hale getirmek için bir mapping
const sectionTitleMapping = {
    pazar_buyuklugu_ve_trendler: { title: "Pazar Büyüklüğü ve Trendler", icon: FaChartBar },
    segment_bazinda_dagilim: { title: "Segment Bazında Dağılım", icon: FaPercentage },
    bolgesel_liderler: { title: "Bölgesel Liderler", icon: FaUserTie },
    bolgesel_dinamikler_ve_ulke_bazli_mro_analizi: { title: "Bölgesel Dinamikler ve Ülke Bazlı MRO Analizi", icon: FaGlobeEurope },
    mevcut_durum_ve_projeksiyonlar_genel: { title: "Mevcut Durum ve Genel Projeksiyonlar", icon: FaChartLine },
    yatirim_icin_stratejik_gerekceler: { title: "Yatırım İçin Stratejik Gerekçeler", icon: FaLightbulb }, // FaLightbulb iconunu bulamadım, FaIndustry kullandım
    afrika_mro_pazari_ve_gelecek_projeksiyonlari: { title: "Afrika MRO Pazarı ve Gelecek Projeksiyonları", icon: FaSortAmountUp },
    asya_pasifik_mro_pazari_ve_gelecek_projeksiyonlari: { title: "Asya-Pasifik MRO Pazarı ve Gelecek Projeksiyonları", icon: FaPaperPlane },
    gelecekteki_egilimler_ve_tahminler_bolgesel: { title: "Gelecekteki Bölgesel Eğilimler ve Tahminler", icon: FaChartLine },
    // Diğer anahtar kelimeler için başlıklar ve ikonlar eklenebilir
};

const getIconForTitle = (title) => {
    if (title?.toLowerCase().includes('sipariş')) return FaPaperPlane;
    if (title?.toLowerCase().includes('filo')) return FaPlaneDeparture;
    if (title?.toLowerCase().includes('teknik')) return FaTools;
    if (title?.toLowerCase().includes('altyapı')) return FaBuilding;
    return FaInfoCircle;
}

const RenderValue = ({ value, level = 0 }) => {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return <span className="text-gray-700 leading-relaxed">{String(value)}</span>;
    }
    if (Array.isArray(value)) {
        return (
            <ul className={`list-disc pl-5 mt-1 space-y-1 ${level > 0 ? 'text-sm' : ''}`}>
                {value.map((item, index) => (
                    <li key={index}>
                        <RenderValue value={item} level={level + 1} />
                    </li>
                ))}
            </ul>
        );
    }
    if (typeof value === 'object' && value !== null) {
        return (
            <div className={`mt-2 pl-4 border-l-2 border-gray-200 ${level > 0 ? 'text-sm' : ''}`}>
                {Object.entries(value).map(([key, val]) => {
                    const subTitle = val?.baslik || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return (
                        <div key={key} className="mb-2">
                            <strong className="font-medium text-gray-800 capitalize">
                                {subTitle !== val ? subTitle + ": " : null}
                            </strong>
                            <RenderValue value={val} level={level + 1} />
                        </div>
                    );
                })}
            </div>
        );
    }
    return null;
};

const ContinentDetailPage = () => {
  const { continentName } = useParams();
  const navigate = useNavigate();
  const [continentData, setContinentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const turkishName = continentNameMapping[continentName] || continentName;
    const data = continentInfoData.bolgeler.find(
      (bolge) => bolge.bolge_adi === turkishName
    );
    if (data) {
      setContinentData(data);
    } else {
      setError(`Veri bulunamadı: ${turkishName} (Aranan İngilizce: ${continentName})`);
    }
    setIsLoading(false);
  }, [continentName]);

  if (isLoading) {
    return <div className="min-h-screen pt-16 bg-gray-50 flex justify-center items-center"><p className="text-xl">Yükleniyor...</p></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50 flex flex-col justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Hata</h1>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => navigate('/')} 
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  if (!continentData) {
    // Bu durum normalde error state'i tarafından yakalanmalı ama bir fallback olarak kalabilir.
    return <div className="min-h-screen pt-16 bg-gray-50 flex justify-center items-center"><p className="text-xl">Kıta bilgisi bulunamadı.</p></div>;
  }

  // bolge_adi ve genel_gorunum_basligi dışındaki anahtarları al
  const mainKeys = Object.keys(continentData).filter(
    key => key !== 'bolge_adi' && key !== 'genel_gorunum_basligi'
  );

  return (
    <div className="min-h-screen pt-16 bg-gray-50 text-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Başlık ve Geri Dön Butonu */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <FaGlobeEurope className="mr-3 text-blue-600" /> 
                    {continentData.bolge_adi}
                </h1>
                <p className="text-xl text-gray-600 mt-1">{continentData.genel_gorunum_basligi}</p>
            </div>
            <button 
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => navigate('/')}
            >
              <FaArrowLeft className="mr-2" />
              Haritaya Geri Dön
            </button>
          </div>
        </div>

        {/* İçerik Bölümleri */}
        <div className="space-y-6">
          {mainKeys.map((key) => {
            const section = sectionTitleMapping[key] || { title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), icon: getIconForTitle(key) };
            const sectionData = continentData[key];

            if (!sectionData || (typeof sectionData === 'object' && Object.keys(sectionData).length === 0)) return null;
            
            return (
              <div key={key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                  {React.createElement(section.icon, { className: "mr-3 text-xl text-blue-600" })}
                  {section.title}
                </h2>
                <RenderValue value={sectionData} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContinentDetailPage; 