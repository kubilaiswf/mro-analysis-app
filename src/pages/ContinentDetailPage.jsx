import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import continentInfoData from '../data/continentInfo.json';
import { 
    FaArrowLeft, FaGlobeEurope, FaChartBar, FaUsers, FaIndustry, 
    FaPlaneDeparture, FaMoneyBillWave, FaListAlt, FaInfoCircle,
    FaChartLine, FaFileAlt, FaBuilding, FaTools, FaDollarSign, FaPercentage, FaSortAmountUp, FaHourglassHalf, FaUserTie, FaClipboardList, FaPaperPlane, FaLightbulb,
    FaLongArrowAltUp, FaLongArrowAltRight, FaTable, FaPlane
} from 'react-icons/fa';

// Chart.js importları
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

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
    // Özel olarak "pazar_buyuklugu_ve_trendler" için ayrı bir render işlevi
    if (typeof value === 'object' && value !== null && value.baslik && value.baslik.includes('Pazarın Büyüklüğü ve Trendleri') && value.veriler) {
        return <RenderMarketTrends data={value.veriler} />;
    }
    
    // Asya-Pasifik için pazar büyüklüğü özel render
    if (typeof value === 'object' && value !== null && 
        (value.baslik && value.baslik.includes('Pazarın Büyüklüğü') && value.veriler && value.buyume_aciklamasi)) {
        return <RenderAsiaPacificMarketSize data={value} />;
    }
    
    // Segment Bazında Dağılım için özel render
    if (typeof value === 'object' && value !== null && 
        ((value.baslik && value.baslik.includes('Segment Bazında Dağılım')) || 
         (value.aciklama_giris && value.segmentler))) {
        return <RenderSegmentDistribution data={value} />;
    }
    
    // Bölgesel Liderler için özel render
    if (typeof value === 'object' && value !== null && 
        ((value.baslik && value.baslik.includes('Bölgesel Liderler')) || 
         (value.aciklama_giris && value.ulkeler))) {
        return <RenderRegionalLeaders data={value} />;
    }
    
    // Mevcut Durum ve Projeksiyonlar için özel render
    if (typeof value === 'object' && value !== null && 
        ((value.baslik && (value.baslik.includes('MRO Pazarı ve Gelecek') || value.baslik.includes('Mevcut Durum'))) || 
         (value.mevcut_ucak_sayisi || value.mevcut_ucak_sayisi_2023 || value.mevcut_durum_2024_itibariyla))) {
        return <RenderProjections data={value} />;
    }
    
    // Yatırım İçin Stratejik Gerekçeler için özel render
    if (typeof value === 'object' && value !== null && 
        (value.baslik && value.baslik.includes('Yatırım İçin Stratejik Gerekçeler'))) {
        return <RenderInvestmentReasons data={value} />;
    }
    
    // Gelecekteki Eğilimler ve Tahminler için özel render
    if (typeof value === 'object' && value !== null && 
        (value.baslik && value.baslik.includes('Gelecekteki Eğilimler ve Tahminler'))) {
        return <RenderFutureTrends data={value} />;
    }
    
    // Asya-Pasifik için özel tablolar
    if (typeof value === 'object' && value !== null && 
        (value.baslik && value.baslik.includes('Bölgesel Dinamikler ve Ülke Bazlı MRO Analizi'))) {
        return <RenderAsiaPacificTables data={value} />;
    }
    
    // Asya-Pasifik Havayolları tablosu için özel render
    if (typeof value === 'object' && value !== null && 
        value.en_fazla_ucak_siparisi_veren_ve_en_buyuk_filolara_sahip_10_havayolu) {
        return <RenderAirlinesTable data={value} />;
    }
    
    // Asya-Pasifik filo yapısı için özel render
    if (typeof value === 'object' && value !== null && 
        value.filo_yapisi && Array.isArray(value.filo_yapisi)) {
        return <RenderFleetStructureTable data={value} />;
    }
    
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        // Eğer değer pasta_grafigi_verileri ise, onu metin olarak render etme (grafik ayrıca render edilecek)
        if (typeof value === 'object' && value !== null && value.hasOwnProperty('pasta_grafigi_verileri')) {
            return null; 
        }
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
                    // pasta_grafigi_verileri anahtarını atla, çünkü bu ayrı bir bileşenle ele alınacak
                    if (key === 'pasta_grafigi_verileri') return null;

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

// Pazar Büyüklüğü ve Trendler için özel bir render component'ı
const RenderMarketTrends = ({ data }) => {
    const years = data.map(item => item.yil);
    const marketSizes = data.map(item => {
        const sizeStr = item.pazar_buyuklugu_usd || '';
        // "X,YZ milyar USD" gibi string'lerden sayısal değeri çıkar
        const numericValue = parseFloat(sizeStr.replace(/[^0-9,]/g, '').replace(',', '.'));
        return numericValue || 0;
    });
    
    return (
        <div className="w-full">
            {/* Görselleştirilmiş veri kartları - THY kırmızı tonlara çevrildi */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {data.map((item, index) => {
                    const isGrowthPositive = item.buyume_orani && !item.buyume_orani.includes('-');
                    const prevYear = index > 0 ? data[index - 1] : null;
                    const showComparison = index > 0;
                    
                    return (
                        <div key={item.yil} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
                            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3">
                                <h3 className="text-lg font-semibold">{item.yil}</h3>
                            </div>
                            
                            <div className="p-4">
                                <div className="mb-3">
                                    <p className="text-sm text-gray-500 mb-1">Pazar Büyüklüğü</p>
                                    <p className="text-2xl font-bold text-gray-800">{item.pazar_buyuklugu_usd}</p>
                                    
                                    {/* Büyüme oranı gösterimi */}
                                    {item.buyume_orani && (
                                        <div className={`flex items-center mt-2 text-sm ${isGrowthPositive ? 'text-green-600' : 'text-red-600'}`}>
                                            {isGrowthPositive ? (
                                                <FaLongArrowAltUp className="mr-1" />
                                            ) : (
                                                <FaLongArrowAltRight className="mr-1" />
                                            )}
                                            <span className="font-medium">{item.buyume_orani}</span>
                                            {showComparison && (
                                                <span className="ml-2 text-gray-500 text-xs">
                                                    {prevYear.pazar_buyuklugu_usd} &#8594; {item.pazar_buyuklugu_usd}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Ek bilgi veya açıklama */}
                                {item.aciklama && (
                                    <div className="mt-2 text-sm text-gray-600 italic border-t border-gray-100 pt-2">
                                        {item.aciklama}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Genel bilgi panosu - THY kırmızı tonlarına çevrildi */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <div className="flex items-start">
                    <FaInfoCircle className="text-red-500 mt-1 mr-3 text-lg flex-shrink-0" />
                    <div>
                        <h4 className="font-medium text-red-700 mb-1">Pazar Trendi Özeti</h4>
                        <p className="text-red-800 text-sm">
                            MRO pazarı {data[0].yil} yılında {data[0].pazar_buyuklugu_usd} seviyesinden, {data[data.length-1].yil} yılında 
                            {data[data.length-1].pazar_buyuklugu_usd} seviyesine ulaşması bekleniyor. 
                            Bu büyüme, sektördeki teknolojik gelişmeler ve artan hava trafiği ile desteklenmektedir.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Bölgesel Liderler için özel bir render component'ı
const RenderRegionalLeaders = ({ data }) => {
    const countries = data.ulkeler || [];
    const introText = data.aciklama_giris || '';
    
    // Ülke kartları için THY temasına uygun arkaplan renkleri 
    const bgColors = [
        'from-red-500 to-red-600',
        'from-red-600 to-red-700',
        'from-red-700 to-red-800',
        'from-gray-600 to-gray-700',
        'from-red-500 to-red-600',
        'from-red-600 to-red-700',
        'from-red-700 to-red-800',
        'from-gray-600 to-gray-700',
    ];
    
    return (
        <div className="w-full">
            {introText && (
                <div className="mb-6 bg-red-50 p-4 rounded-lg border border-red-100">
                    <p className="text-red-800">{introText}</p>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {countries.map((country, index) => {
                    const bgColorClass = bgColors[index % bgColors.length];
                    const countryName = country.ulke || '';
                    const description = country.aciklama || country.bilgi || '';
                    
                    return (
                        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                            <div className={`bg-gradient-to-r ${bgColorClass} text-white px-4 py-3`}>
                                <h3 className="text-lg font-semibold">{countryName}</h3>
                            </div>
                            
                            <div className="p-4">
                                <p className="text-gray-700">{description}</p>
                                
                                {/* Eğer ek bilgiler varsa göster */}
                                {Object.keys(country).filter(key => !['ulke', 'aciklama', 'bilgi'].includes(key)).map(key => (
                                    <div key={key} className="mt-2 pt-2 border-t border-gray-100">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: </span>
                                            {country[key]}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Mevcut Durum ve Projeksiyonlar için özel render bileşeni
const RenderProjections = ({ data }) => {
    const title = data.baslik || '';
    
    // Veri anahtarlarını belirle - farklı kıtalarda farklı alanlar olabilir
    const presentKeys = Object.keys(data).filter(k => 
        k.toLowerCase().includes('mevcut') || 
        k.toLowerCase().includes('2023') || 
        k.toLowerCase().includes('2024'));
    
    const futureKeys = Object.keys(data).filter(k => 
        k.toLowerCase().includes('projeksiyon') || 
        k.toLowerCase().includes('2030') || 
        k.toLowerCase().includes('2033') || 
        k.toLowerCase().includes('2042') || 
        k.toLowerCase().includes('tahmin'));
    
    return (
        <div className="w-full">
            {/* Title rendering removed to avoid duplication with main page title */}
            
            <div className="grid md:grid-cols-2 gap-6">
                {/* Mevcut Durum - kırmızı tonlarına çevrildi */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 shadow-md border border-red-100">
                    <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white mr-2">
                            <FaPlaneDeparture />
                        </span>
                        Mevcut Durum
                    </h3>
                    
                    <div className="space-y-4">
                        {presentKeys.map(key => {
                            // const value = typeof data[key] === 'object' ? data[key].bilgi || '' : data[key]; // Old logic
                            return (
                                <div key={key} className="mb-2">
                                    <div className="bg-white rounded-lg p-4 shadow-sm border border-red-100">
                                        {/* <p className="text-red-800">{value}</p> */}
                                        <RenderValue value={data[key]} level={1} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                {/* Projeksiyonlar - gri tonlarına çevrildi (THY tema uyumu) */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-5 shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-600 text-white mr-2">
                            <FaChartLine />
                        </span>
                        Gelecek Projeksiyonları
                    </h3>
                    
                    <div className="space-y-4">
                        {futureKeys.map(key => {
                            // const value = typeof data[key] === 'object' ? data[key].bilgi || '' : data[key]; // Old logic
                            const yearMatch = key.match(/\\d{4}/);
                            const yearText = yearMatch ? yearMatch[0] + ' Yılı' : key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            
                            return (
                                <div key={key} className="mb-2">
                                    <p className="text-sm text-gray-600 mb-1">{yearText}</p>
                                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                        {/* <p className="text-gray-800">{value}</p> */}
                                        <RenderValue value={data[key]} level={1} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            {/* Diğer bilgiler varsa */}
            {Object.keys(data).filter(k => 
                !k.includes('baslik') && 
                !presentKeys.includes(k) && 
                !futureKeys.includes(k)).map(key => {
                
                if (typeof data[key] === 'object') {
                    return (
                        <div key={key} className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-2">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h4>
                            <RenderValue value={data[key]} level={1} />
                        </div>
                    );
                }
                
                return (
                    <div key={key} className="mt-4">
                        <p className="text-gray-700">
                            <span className="font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: </span>
                            {data[key]}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

// Yatırım İçin Stratejik Gerekçeler için özel render bileşeni
const RenderInvestmentReasons = ({ data }) => {
    // Başlık dışındaki tüm anahtarları al
    const keys = Object.keys(data).filter(k => k !== 'baslik');
    
    // Icon mapping for reason types
    const getIconForReason = (key) => {
        if (key.includes('ucak_siparis')) return FaPlaneDeparture;
        if (key.includes('filo')) return FaPlaneDeparture;
        if (key.includes('teknolojik')) return FaTools;
        if (key.includes('altyap')) return FaBuilding;
        if (key.includes('regulasyon')) return FaClipboardList;
        if (key.includes('yolcu')) return FaUsers;
        if (key.includes('gerekce')) return FaLightbulb;
        return FaLightbulb;
    };
    
    return (
        <div className="w-full space-y-6">
            {keys.map((key, index) => {
                const item = data[key];
                const title = item.baslik || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const Icon = getIconForReason(key);
                
                // Specific handler for "yeni_ucak_siparisleri" which contains the airline list
                if (item.en_fazla_ucak_siparisi_veren_ve_en_buyuk_filolara_sahip_10_havayolu && Array.isArray(item.en_fazla_ucak_siparisi_veren_ve_en_buyuk_filolara_sahip_10_havayolu)) {
                    return (
                        <div key={key} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-4 flex items-center">
                                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-white bg-opacity-20 text-white mr-3">
                                    <Icon className="text-xl" />
                                </span>
                                <h3 className="text-lg font-semibold">{title}</h3>
                            </div>
                            <div className="p-5">
                                <RenderAirlinesTable data={item} />
                            </div>
                        </div>
                    );
                }
                // Specific handler for items containing "filo_yapisi" (like in Asia-Pacific investment reasons)
                else if (item.filo_yapisi && Array.isArray(item.filo_yapisi)) {
                    return (
                        <div key={key} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-4 flex items-center">
                                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-white bg-opacity-20 text-white mr-3">
                                    <Icon className="text-xl" />
                                </span>
                                <h3 className="text-lg font-semibold">{title}</h3>
                            </div>
                            <div className="p-5">
                                <RenderFleetStructureTable data={item} />
                            </div>
                        </div>
                    );
                }
                // Eğer bu madde bir basit açıklama içeriyorsa
                else if (item.aciklama && typeof item.aciklama === 'string') {
                    return (
                        <div key={key} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-4 flex items-center">
                                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-white bg-opacity-20 text-white mr-3">
                                    <Icon className="text-xl" />
                                </span>
                                <h3 className="text-lg font-semibold">{title}</h3>
                            </div>
                            
                            <div className="p-5">
                                <p className="text-gray-700">{item.aciklama}</p>
                                
                                {/* İç içe diğer öğeleri render et */}
                                {Object.keys(item).filter(subKey => subKey !== 'baslik' && subKey !== 'aciklama').map(subKey => (
                                    <div key={subKey} className="mt-4 pt-4 border-t border-gray-100">
                                        <h4 className="font-medium text-gray-800 mb-2">
                                            {subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </h4>
                                        <RenderValue value={item[subKey]} level={1} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }
                
                // Eğer bu madde listeleri veya kompleks yapı içeriyorsa (generic fallback)
                else {
                    return (
                        <div key={key} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-4 flex items-center">
                                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-white bg-opacity-20 text-white mr-3">
                                    <Icon className="text-xl" />
                                </span>
                                <h3 className="text-lg font-semibold">{title}</h3>
                            </div>
                            
                            <div className="p-5">
                                {/* İç içe component'ları render et */}
                                {Object.keys(item).filter(subKey => subKey !== 'baslik').map(subKey => {
                                    // Skip if it's just the title again
                                    if (subKey === 'baslik') return null;
                                    
                                    // Heading for subsections
                                    const subItemData = item[subKey];
                                    const subItemTitle = subItemData?.baslik || 
                                                    subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                    
                                    // Special case for arrays - like lists of airlines, examples, etc.
                                    if (Array.isArray(subItemData)) {
                                        return (
                                            <div key={subKey} className="mb-4">
                                                <h4 className="text-lg font-medium text-gray-800 mb-3">{subItemTitle}</h4>
                                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                                    <RenderValue value={subItemData} level={1} />
                                                </div>
                                            </div>
                                        );
                                    }
                                    
                                    // For objects with content
                                    else if (typeof subItemData === 'object' && subItemData !== null) {
                                        const subContent = subItemData.aciklama || '';
                                        
                                        return (
                                            <div key={subKey} className="mb-4">
                                                <h4 className="text-lg font-medium text-gray-800 mb-2">{subItemTitle}</h4>
                                                {subContent && <p className="text-gray-700 mb-3">{subContent}</p>}
                                                
                                                {/* Other fields */}
                                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                                    <RenderValue value={
                                                        Object.fromEntries(
                                                            Object.entries(subItemData).filter(([k]) => k !== 'baslik' && k !== 'aciklama')
                                                        )
                                                    } level={1} />
                                                </div>
                                            </div>
                                        );
                                    }
                                    
                                    // Simple key-value pairs
                                    else {
                                        return (
                                            <div key={subKey} className="mb-3">
                                                <h4 className="font-medium text-gray-800 mb-1">{subItemTitle}:</h4>
                                                <p className="text-gray-700">{String(subItemData)}</p>
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        </div>
                    );
                }
            })}
        </div>
    );
};

// Gelecekteki Eğilimler ve Tahminler için özel render bileşeni
const RenderFutureTrends = ({ data }) => {
    const title = data.baslik || '';
    const boeing_tahmini = data.boeing_tahmini || '';
    const tahminler = data.tahminler || [];
    
    // İçeriği kontrol et
    const hasListItems = Array.isArray(tahminler) && tahminler.length > 0;
    const hasBoeingEstimation = boeing_tahmini && boeing_tahmini.length > 0;
    
    return (
        <div className="w-full">
            {/* Tahminler listesi varsa */}
            {hasListItems && (
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-5 shadow border border-red-100">
                        <h3 className="text-xl font-semibold text-red-800 mb-4 pb-2 border-b border-red-200">
                            Gelecek Tahminleri ve Projeksiyonlar
                        </h3>
                        
                        <div className="space-y-3">
                            {tahminler.map((item, index) => (
                                <div key={index} className="flex items-start bg-white rounded-lg p-4 shadow-sm border border-red-100">
                                    <div className="flex-shrink-0 bg-red-100 text-red-700 font-semibold rounded-full w-8 h-8 flex items-center justify-center mr-3">
                                        {index + 1}
                                    </div>
                                    <div className="text-red-900">{item}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Boeing Tahmini */}
            {hasBoeingEstimation && (
                <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-lg p-6 shadow-lg">
                    <div className="flex items-center mb-4">
                        <FaChartLine className="text-3xl mr-3" />
                        <h3 className="text-xl font-bold">Boeing Tahminleri</h3>
                    </div>
                    
                    <p className="text-white text-lg leading-relaxed">{boeing_tahmini}</p>
                    
                    <div className="mt-4 text-red-200 text-sm italic">
                        Kaynak: Boeing Commercial Market Outlook
                    </div>
                </div>
            )}
            
            {/* Eğer yukarıdaki hiçbir koşula uymazsa genel render işlevini kullan */}
            {!hasListItems && !hasBoeingEstimation && (
                <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
                    {title && <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>}
                    
                    {/* Tüm içeriği render et */}
                    {Object.keys(data).filter(key => key !== 'baslik').map(key => (
                        <div key={key} className="mb-4">
                            <h4 className="font-medium text-gray-800 mb-2">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <RenderValue value={data[key]} level={1} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Segment Bazında Dağılım için özel render bileşeni
const RenderSegmentDistribution = ({ data }) => {
    const title = data.baslik || '';
    const description = data.aciklama || data.aciklama_giris || '';
    const chartDescription = data.pasta_grafigi_aciklama || '';
    // Pasta grafiği sadece Avrupa için ve veri varsa alınacak
    const { continentName } = useParams(); // Kıta adını al
    const pieChartData = continentName === "Europe" && data.pasta_grafigi_verileri;
    const segments = data.segmentler || [];
    
    // Segment kartları için renkler - THY temasına uygun kırmızı ve gri tonları kullanıldı
    const segmentColors = [
        { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
        { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' },
        { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
        { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-100' },
        { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
    ];
    
    const hasSegments = segments.length > 0;
    const hasContent = pieChartData || hasSegments;
    
    if (!hasContent && !description) {
        return null; // İçerik yoksa hiçbir şey gösterme
    }
    
    return (
        <div className="w-full">
            {description && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700">{description}</p>
                </div>
            )}
            
            {hasContent && (
                <div className={`grid grid-cols-1 ${pieChartData && hasSegments ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6 mb-6`}>
                    {/* Sol taraf: Pasta grafik (sadece Avrupa için ve varsa) */}
                    {pieChartData && (
                        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
                            <Doughnut 
                                data={pieChartData} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: true,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                            labels: {
                                                color: '#4A5568', // Tailwind gray-700
                                                font: {
                                                    size: 14
                                                }
                                            }
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: function(context) {
                                                    let label = context.label || '';
                                                    if (label) {
                                                        label += ': ';
                                                    }
                                                    if (context.parsed !== null) {
                                                        label += context.parsed + '%';
                                                    }
                                                    return label;
                                                }
                                            },
                                            bodyFont: { size: 14 },
                                            titleFont: { size: 16 }
                                        }
                                    }
                                }}
                            />
                            
                            {chartDescription && (
                                <div className="mt-4 text-sm text-gray-600 italic">
                                    {chartDescription}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Segment listesi (varsa) */}
                    {hasSegments && (
                        <div className={`space-y-4 ${pieChartData ? '' : 'md:grid md:grid-cols-2 md:gap-4'}`}>
                            {segments.map((segment, index) => {
                                const segmentName = segment.adi || '';
                                const segmentDescription = segment.aciklama || '';
                                const colorSet = segmentColors[index % segmentColors.length];
                                
                                return (
                                    <div 
                                        key={index} 
                                        className={`rounded-lg p-4 shadow-sm ${colorSet.bg} ${colorSet.border} border`}
                                    >
                                        <h4 className={`font-semibold mb-2 ${colorSet.text}`}>{segmentName}</h4>
                                        <p className={`${colorSet.text}`}>{segmentDescription}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
            
            {/* Diğer veriler (açıklama veya başlık dışında kalanlar) */}
            {Object.keys(data).filter(key => 
                !['baslik', 'aciklama', 'aciklama_giris', 'pasta_grafigi_aciklama', 'pasta_grafigi_verileri', 'segmentler'].includes(key)).map(key => (
                <div key={key} className="mt-4">
                    <h4 className="font-medium text-gray-800 mb-2">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <RenderValue value={data[key]} level={1} />
                    </div>
                </div>
            ))}
        </div>
    );
};

// Asya-Pasifik bölgesi için tablolar
const RenderAsiaPacificTables = ({ data }) => {
    const countries = data.ulkeler || [];
    
    return (
        <div className="w-full">
            <div className="mb-4 bg-red-50 p-4 rounded-lg border border-red-100">
                <p className="text-red-800">
                    Asya-Pasifik bölgesindeki ülkelerin MRO pazarına ilişkin detaylı veriler aşağıdaki tabloda gösterilmektedir.
                </p>
            </div>
            
            {/* Ülke bazlı MRO analizi tablosu */}
            <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                            <th className="py-3 px-4 text-left font-semibold">Ülke</th>
                            <th className="py-3 px-4 text-left font-semibold">MRO Pazar Büyüklüğü</th>
                            <th className="py-3 px-4 text-left font-semibold">Filo</th>
                            <th className="py-3 px-4 text-left font-semibold">Diğer Bilgiler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {countries.map((country, index) => {
                            // Verileri toplama
                            const countryName = country.ulke_adi || '';
                            const marketSize = country.pazar_buyuklugu || '';
                            const fleetSize = country.filo_buyuklugu || '';
                            
                            // Diğer bilgiler
                            const otherFields = Object.keys(country).filter(key => 
                                !['ulke_adi', 'pazar_buyuklugu', 'filo_buyuklugu'].includes(key)
                            );
                            
                            return (
                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="py-3 px-4 border-b border-gray-200 font-medium">{countryName}</td>
                                    <td className="py-3 px-4 border-b border-gray-200">{marketSize}</td>
                                    <td className="py-3 px-4 border-b border-gray-200">{fleetSize}</td>
                                    <td className="py-3 px-4 border-b border-gray-200">
                                        <div className="space-y-2">
                                            {otherFields.map(field => (
                                                <div key={field} className="text-sm">
                                                    <span className="font-medium text-gray-700">
                                                        {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                                    </span>{' '}
                                                    <span className="text-gray-600">{country[field]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Havayolları tablosu için bileşen
const RenderAirlinesTable = ({ data }) => {
    const airlines = data.en_fazla_ucak_siparisi_veren_ve_en_buyuk_filolara_sahip_10_havayolu || [];
    const title = data.baslik || '';
    const description = data.giris_aciklamasi || '';
    
    return (
        <div className="w-full">
            {title && (
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
            )}
            
            {description && (
                <div className="mb-4 bg-red-50 p-4 rounded-lg border border-red-100">
                    <p className="text-red-800">{description}</p>
                </div>
            )}
            
            {/* Havayolları tablosu */}
            <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                            <th className="py-3 px-4 text-left font-semibold">Sıra</th>
                            <th className="py-3 px-4 text-left font-semibold">Havayolu</th>
                            <th className="py-3 px-4 text-left font-semibold">Ülke</th>
                            <th className="py-3 px-4 text-left font-semibold">Mevcut Filo</th>
                            <th className="py-3 px-4 text-left font-semibold">Yeni Siparişler</th>
                            <th className="py-3 px-4 text-left font-semibold">Notlar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {airlines.map((airline, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="py-3 px-4 border-b border-gray-200 text-center font-bold text-red-600">{airline.sira || (index + 1)}</td>
                                <td className="py-3 px-4 border-b border-gray-200 font-medium">{airline.havayolu_sirketi || ''}</td>
                                <td className="py-3 px-4 border-b border-gray-200">{airline.ulke || ''}</td>
                                <td className="py-3 px-4 border-b border-gray-200">{airline.mevcut_filo || ''}</td>
                                <td className="py-3 px-4 border-b border-gray-200">{airline.yeni_siparisler || ''}</td>
                                <td className="py-3 px-4 border-b border-gray-200 text-sm">{airline.one_cikan_siparisler_ve_notlar || ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Filo yapısı tablosu için bileşen
const RenderFleetStructureTable = ({ data }) => {
    const fleetStructure = data.filo_yapisi || [];
    const title = data.baslik || '';
    
    return (
        <div className="w-full">
            {title && (
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
            )}
            
            {/* Filo yapısı tablosu */}
            <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                            <th className="py-3 px-4 text-left font-semibold">Uçak Türü</th>
                            <th className="py-3 px-4 text-left font-semibold">Filo İçindeki Pay</th>
                            <th className="py-3 px-4 text-left font-semibold">Açıklama</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fleetStructure.map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="py-3 px-4 border-b border-gray-200 font-medium flex items-center">
                                    <FaPlane className="mr-2 text-red-500" /> {item.ucak_turu || ''}
                                </td>
                                <td className="py-3 px-4 border-b border-gray-200 font-bold text-red-600">{item.filo_icindeki_pay_yuzde || ''}</td>
                                <td className="py-3 px-4 border-b border-gray-200">{item.aciklama || ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Gelecek tahmini bölümü */}
            {data.degisim_trendleri && (
                <div className="mt-4">
                    <h4 className="text-lg font-medium text-gray-800 mb-2">Değişim Trendleri</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.degisim_trendleri.map((trend, index) => (
                            <div key={index} className="bg-red-50 rounded-lg p-4 border border-red-100">
                                <div className="font-medium text-red-700 mb-1 flex items-center">
                                    <FaPlane className="mr-2" /> {trend.ucak_turu}
                                </div>
                                <div className="text-lg font-bold text-red-600 mb-2">
                                    Artış: {trend.yillik_ortalama_artis}
                                </div>
                                <p className="text-gray-700">{trend.degisim_trendi_aciklamasi}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Asya-Pasifik pazar büyüklüğü ve trendler için özel render bileşeni
const RenderAsiaPacificMarketSize = ({ data }) => {
    const marketData = data.veriler || [];
    const description = data.buyume_aciklamasi || '';
    
    // CAGR ve yıllık değerleri ayır
    const yearlyData = marketData.filter(item => item.yil);
    const cagrData = marketData.find(item => item.donem === "CAGR");
    
    return (
        <div className="w-full">
            {/* Pazar Büyüklüğü Veriler Kartı */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-6">
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4">
                    <h3 className="text-xl font-semibold flex items-center">
                        <FaChartBar className="mr-2" /> Asya-Pasifik MRO Pazar Büyüklüğü Projeksiyonu
                    </h3>
                </div>
                
                <div className="p-4">
                    {/* Tablo */}
                    <div className="overflow-x-auto mb-4">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="py-2 px-4 border-b text-left font-semibold">Yıl</th>
                                    <th className="py-2 px-4 border-b text-right font-semibold">Pazar Büyüklüğü (Milyar USD)</th>
                                    <th className="py-2 px-4 border-b text-center font-semibold">Değişim</th>
                                </tr>
                            </thead>
                            <tbody>
                                {yearlyData.map((item, index) => {
                                    const isLastYear = index === yearlyData.length - 1;
                                    const prevYear = index > 0 ? yearlyData[index - 1] : null;
                                    const growth = prevYear ? 
                                        (((item.pazar_buyuklugu_milyar_abd_dolari - prevYear.pazar_buyuklugu_milyar_abd_dolari) / 
                                          prevYear.pazar_buyuklugu_milyar_abd_dolari) * 100).toFixed(1) : null;
                                    
                                    return (
                                        <tr key={index} className={isLastYear ? 'bg-red-50' : ''}>
                                            <td className="py-3 px-4 border-b font-medium">{item.yil}</td>
                                            <td className="py-3 px-4 border-b text-right font-bold text-red-700">
                                                ${item.pazar_buyuklugu_milyar_abd_dolari?.toLocaleString() || '-'}
                                            </td>
                                            <td className="py-3 px-4 border-b text-center">
                                                {growth && (
                                                    <span className="inline-flex items-center text-green-600">
                                                        <FaLongArrowAltUp className="mr-1" />
                                                        +{growth}%
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                {cagrData && (
                                    <tr className="bg-gray-100">
                                        <td className="py-3 px-4 font-semibold border-t">CAGR (Yıllık Birleşik Büyüme Oranı)</td>
                                        <td className="py-3 px-4 border-t"></td>
                                        <td className="py-3 px-4 text-center font-bold text-red-600 border-t">{cagrData.oran}</td>
                                    </tr>
                                )}
                            </tfoot>
                        </table>
                    </div>
                    
                    {/* CAGR Açıklama */}
                    <div className="text-sm text-gray-500 italic mb-4">
                        * CAGR: Compound Annual Growth Rate (Yıllık Bileşik Büyüme Oranı)
                    </div>
                    
                    {/* Büyüme açıklaması */}
                    {description && (
                        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                            <div className="flex items-start">
                                <FaInfoCircle className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                                <p className="text-red-800">{description}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
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
            className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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
  
  // Asya-Pasifik için özel başlık gösterimi
  const isAsiaPacific = continentName === "Asia";
  
  return (
    <div className="min-h-screen pt-16 bg-gray-50 text-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Başlık ve Geri Dön Butonu */}
        <div className={`rounded-lg shadow-sm border border-gray-200 p-6 mb-6 ${isAsiaPacific ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' : 'bg-white'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className={`text-3xl font-bold flex items-center ${isAsiaPacific ? 'text-white' : 'text-gray-800'}`}>
                    <FaGlobeEurope className="mr-3 text-red-600" /> 
                    {continentData.bolge_adi}
                </h1>
                <p className={`text-xl mt-1 ${isAsiaPacific ? 'text-white' : 'text-gray-600'}`}>{continentData.genel_gorunum_basligi}</p>
                
                {isAsiaPacific && (
                  <div className="mt-3 bg-white bg-opacity-20 p-3 rounded-lg">
                    <p className="text-white text-sm">
                      Asya-Pasifik bölgesi, havacılık MRO (Bakım, Onarım ve Revizyon) pazarının en hızlı büyüyen bölgesi olmayı sürdürüyor. 
                      Bu sayfada bölgenin güncel pazar büyüklüğü, segment dağılımı, ülke bazlı analizler ve yatırım fırsatları sunulmaktadır.
                    </p>
                  </div>
                )}
            </div>
            <button 
              className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${isAsiaPacific ? 'bg-white text-red-700 hover:bg-red-50' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
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
            
            // Avrupa ve segment_bazinda_dagilim için özel grafik render
            const isEuropeSegmentDistribution = continentName === "Europe" && key === "segment_bazinda_dagilim";
            const pieChartData = isEuropeSegmentDistribution && sectionData.pasta_grafigi_verileri;

            return (
              <div key={key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                  {React.createElement(section.icon, { className: "mr-3 text-xl text-red-600" })}
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