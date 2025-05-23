import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// İkonlar (Gerektiği kadarını ekleyin)
import {
    FaArrowLeft, FaGlobeEurope, FaChartBar, FaUsers, FaIndustry,
    FaPlaneDeparture, FaMoneyBillWave, FaListAlt, FaInfoCircle,
    FaChartLine, FaFileAlt, FaBuilding, FaTools, FaDollarSign, FaPercentage, FaSortAmountUp, FaHourglassHalf, FaUserTie, FaClipboardList, FaPaperPlane, FaLightbulb,
    FaLongArrowAltUp, FaTable, FaPlane, FaMapPin, FaListOl, FaFileInvoiceDollar, FaChartPie
} from 'react-icons/fa';
// Chart.js
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import MROWorldMap from '../components/charts/MROWorldMap';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// --- KITA ADI VE DOSYA EŞLEŞTİRME ---
const continentNameMapping = {
  "North America": "Kuzey Amerika",
  "South America": "Güney Amerika",
  "Europe": "Avrupa",
  "Africa": "Afrika",
  "Asia": "Asya-Pasifik", // JSON dosya adıyla eşleşmeli
  "Oceania": "Okyanusya"
};
const continentFileMapping = {
    "Europe": "europe",
    "Africa": "africa",
    "Asia": "asia_pacific", // Dosya adımız asia_pacific.json
    "North America": "north_america",
    "South America": "south_america"
    // Diğer kıtalar eklenecek:
    // "Oceania": "oceania"
};

// --- BÖLÜM İKON EŞLEŞTİRME ---
const sectionIconMapping = {
    pazar_buyuklugu_ve_trendler: FaChartBar,
    pazar_buyuklugu_ve_trendler_afrika: FaChartBar,
    pazar_buyuklugu_ve_trendler_asya: FaChartBar,
    pazar_buyuklugu_ve_trendler_na: FaChartBar,
    pazar_buyuklugu_ve_trendler_sa: FaChartBar,
    segment_bazinda_dagilim: FaPercentage,
    segment_bazinda_dagilim_afrika: FaPercentage,
    segment_bazinda_dagilim_asya: FaPercentage,
    segment_bazinda_dagilim_na: FaPercentage,
    segment_bazinda_dagilim_sa: FaPercentage,
    bolgesel_liderler: FaUserTie,
    bolgesel_liderler_afrika: FaUserTie,
    bolgesel_liderler_na: FaUserTie,
    bolgesel_liderler_sa: FaUserTie,
    mevcut_durum_ve_projeksiyonlar_genel: FaChartLine,
    afrika_mro_pazari_ve_gelecek_projeksiyonlari: FaChartLine,
    asya_pasifik_mro_pazari_ve_gelecek_projeksiyonlari: FaChartLine,
    na_mro_pazari_ve_gelecek_projeksiyonlari: FaChartLine,
    sa_mro_pazari_ve_gelecek_projeksiyonlari: FaChartLine,
    yatirim_icin_stratejik_gerekceler: FaLightbulb,
    yatirim_icin_stratejik_gerekceler_afrika: FaLightbulb,
    yatirim_icin_stratejik_gerekceler_asya: FaLightbulb,
    yatirim_icin_stratejik_gerekceler_na: FaLightbulb,
    yatirim_icin_stratejik_gerekceler_sa: FaLightbulb,
    filo_dagilimi_2025_na: FaPlane,
    filo_dagilimi_2025_sa: FaPlane,
    gelecekteki_egilimler_ve_tahminler_bolgesel: FaChartLine,
    gelecekteki_egilimler_ve_tahminler_afrika: FaChartLine,
    gelecekteki_egilimler_ve_tahminler_na: FaChartLine,
    gelecekteki_egilimler_ve_tahminler_sa: FaChartLine,
    bolgesel_dinamikler_ulke_bazli_asya: FaGlobeEurope,
    default: FaInfoCircle
};

// --- GENEL AMAÇLI RENDER BİLEŞENLERİ ---

// Tip: 'pazar_trendi_tablosu_genel'
const RenderPazarTrendiTablosuGenel = ({ bolumData }) => (
    <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{bolumData.baslikAna}</h2>
        <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full bg-white">
                <thead className="bg-red-600 text-white">
                    <tr>
                        <th className="py-3 px-4 text-left font-semibold">Yıl</th>
                        <th className="py-3 px-4 text-left font-semibold">Pazar Büyüklüğü (USD)</th>
                        <th className="py-3 px-4 text-left font-semibold">Büyüme Oranı</th>
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {bolumData.tabloVerileri.map((item, index) => (
                        <tr key={item.yil} className={index % 2 === 0 ? 'bg-red-50' : 'bg-white'}>
                            <td className="py-3 px-4 border-b border-gray-200">{item.yil}</td>
                            <td className="py-3 px-4 border-b border-gray-200">{item.pazar_buyuklugu_usd}</td>
                            <td className="py-3 px-4 border-b border-gray-200">{item.buyume_orani_str}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// Tip: 'segment_dagilimi_pasta_grafik_genel'
const RenderSegmentDagilimiPastaGrafikGenel = ({ bolumData }) => (
    <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{bolumData.baslikAna}</h2>
        {bolumData.giris_aciklamasi_html &&
            <p className="mb-4 text-gray-700" dangerouslySetInnerHTML={{ __html: bolumData.giris_aciklamasi_html }} />}
        
        <div className="grid md:grid-cols-2 gap-6 items-center">
            {bolumData.pasta_grafigi_verileri && (
                <div className="bg-gray-50 p-4 rounded-lg shadow max-w-sm mx-auto h-90">
                    {bolumData.pasta_grafigi_baslik && <h3 className="text-lg font-semibold text-center text-gray-700 mb-3">{bolumData.pasta_grafigi_baslik}</h3>}
                    <Doughnut
                        data={bolumData.pasta_grafigi_verileri}
                        options={{
                            responsive: true,
                            maintainAspectRatio: true,
                            plugins: { legend: { position: 'top', labels:{color: '#4A5568', font: {size: 13}} } }
                        }}
                    />
                </div>
            )}
            {bolumData.grafik_alti_aciklama_html &&
                <div className="text-sm text-gray-600 italic" dangerouslySetInnerHTML={{ __html: bolumData.grafik_alti_aciklama_html }} />}
        </div>
    </div>
);

// Tip: 'madde_imleriyle_liste'
const RenderMaddeImleriyleListe = ({ bolumData }) => (
    <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{bolumData.baslikAna}</h2>
        {bolumData.giris_paragrafi_html && <p className="mb-3 text-gray-700" dangerouslySetInnerHTML={{__html: bolumData.giris_paragrafi_html}}/>}
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {bolumData.liste_elemanlari_html.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
        </ul>
    </div>
);

// Tip: 'basit_metin_bloklari'
const RenderBasitMetinBloklari = ({ bolumData }) => (
    <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{bolumData.baslikAna}</h2>
        {bolumData.bloklar_html && bolumData.bloklar_html.map((blok, index) => (
            <p key={index} className="text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: blok }} />
        ))}
        {/* Bazen bloklar nesne dizisi olarak gelebilir */}
        {bolumData.bloklar && Array.isArray(bolumData.bloklar) && bolumData.bloklar.map((blok, index) => (
             <div key={index} className="mb-3">
                {blok.baslik_alt && <h3 className="text-lg font-semibold text-red-700 mb-1">{blok.baslik_alt}</h3>}
                <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: blok.icerik_html }} />
            </div>
        ))}
    </div>
);

// Tip: 'yatirim_gerekceleri_detayli' (Genel Yatırım Gerekçeleri Render'ı)
const RenderYatirimGerekceleriDetayli = ({ bolumData }) => (
    <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{bolumData.baslikAna}</h2>
        <div className="space-y-8">
            {bolumData.alt_bolumler.map(alt => (
                <div key={alt.id} className="p-4 bg-red-50 rounded-lg border border-red-100 shadow">
                    <h3 className="text-xl font-semibold text-red-700 mb-3">{alt.baslik_alt}</h3>
                    {alt.aciklama_html && <p className="text-gray-700 mb-3" dangerouslySetInnerHTML={{ __html: alt.aciklama_html }} />}
                    
                    {alt.alt_baslik_icerik && <h4 className="font-medium text-gray-700 my-2" dangerouslySetInnerHTML={{__html: alt.alt_baslik_icerik}} />}

                    {alt.liste_tipi === "numarali_alt_detayli_liste" && alt.liste_verileri && (
                        <ol className="list-decimal pl-5 space-y-3">
                            {alt.liste_verileri.map((item, idx) => (
                                <li key={idx}>
                                    <p className="font-medium text-gray-800" dangerouslySetInnerHTML={{__html: item.ana_baslik}}/>
                                    {item.alt_detaylar_html && item.alt_detaylar_html.map((detay, i) =>(
                                        <p key={i} className="text-sm text-gray-600 ml-4" dangerouslySetInnerHTML={{__html: `• ${detay}`}}/>
                                    ))}
                                </li>
                            ))}
                        </ol>
                    )}

                    {alt.madde_imleriyle_liste_html && (
                        <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
                            {alt.madde_imleriyle_liste_html.map((ornek, i) => <li key={i} dangerouslySetInnerHTML={{__html: ornek}} />)}
                        </ul>
                    )}
                     {alt.alt_baslik_icerik_2 && <h4 className="font-medium text-gray-700 my-2" dangerouslySetInnerHTML={{__html: alt.alt_baslik_icerik_2}} />}
                     {alt.madde_imleriyle_liste_html_2 && (
                        <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
                            {alt.madde_imleriyle_liste_html_2.map((ornek, i) => <li key={i} dangerouslySetInnerHTML={{__html: ornek}} />)}
                        </ul>
                    )}


                    {alt.paragraflar_html && alt.paragraflar_html.map((p, i) => (
                        <p key={i} className="text-gray-700 mb-2" dangerouslySetInnerHTML={{__html: p}}/>
                    ))}
                    
                    {alt.sonuc_paragrafi_html && <p className="text-gray-700 mt-3 italic" dangerouslySetInnerHTML={{__html: alt.sonuc_paragrafi_html}}/>}

                    {/* Tablo tipleri için */}
                    {alt.liste_tipi === "tablo_siparis" && alt.tablo_verileri && (
                        <div className="overflow-x-auto mt-3 shadow rounded-lg">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-200">
                                    <tr>
                                        {alt.tablo_basliklari.map(th => <th key={th} className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{th}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {alt.tablo_verileri.map((row, rowIndex) => (
                                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                            {row.map((cell, cellIndex) => <td key={cellIndex} className="py-2 px-3 text-sm text-gray-700" dangerouslySetInnerHTML={{__html: cell}}/>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {alt.tip_alt === "tablo_havayolu_siparis_asya" && alt.tablo_verileri && (
                         <div className="overflow-x-auto mt-3 shadow rounded-lg">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-200">
                                    <tr>
                                        {alt.tablo_basliklari.map(th => <th key={th} className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{th}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {alt.tablo_verileri.map((row, rowIndex) => (
                                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                            {row.map((cell, cellIndex) => <td key={cellIndex} className="py-2 px-3 text-sm text-gray-700" dangerouslySetInnerHTML={{__html: String(cell)}}/>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                     {alt.tip_alt === "tablo_filo_yapisi" && alt.tablo_verileri && (
                         <div className="overflow-x-auto mt-3 shadow rounded-lg">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-200">
                                    <tr>
                                        {alt.tablo_basliklari.map(th => <th key={th} className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{th}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {alt.tablo_verileri.map((row, rowIndex) => (
                                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                            {row.map((cell, cellIndex) => <td key={cellIndex} className="py-2 px-3 text-sm text-gray-700" dangerouslySetInnerHTML={{__html: cell}}/>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                     {alt.tip_alt === "tablo_degisim_trendi" && alt.tablo_verileri && (
                         <div className="overflow-x-auto mt-3 shadow rounded-lg">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-200">
                                    <tr>
                                        {alt.tablo_basliklari.map(th => <th key={th} className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{th}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {alt.tablo_verileri.map((row, rowIndex) => (
                                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                            {row.map((cell, cellIndex) => <td key={cellIndex} className="py-2 px-3 text-sm text-gray-700" dangerouslySetInnerHTML={{__html: cell}}/>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

// Tip: 'pazar_trendi_tablosu_cagr_aciklamali'
const RenderPazarTrendiTablosuCagrAciklamali = ({ bolumData }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{bolumData.baslikAna}</h2>
        <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full bg-white">
                <thead className="bg-red-600 text-white">
                    <tr>
                        <th className="py-3 px-4 text-left font-semibold">Yıl</th>
                        <th className="py-3 px-4 text-left font-semibold">Pazar Büyüklüğü (USD)</th>
                        <th className="py-3 px-4 text-left font-semibold">Büyüme Oranı</th>
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {bolumData.tabloVerileri.map((item, index) => (
                        <tr key={item.yil} className={index % 2 === 0 ? 'bg-red-50' : 'bg-white'}>
                            <td className="py-3 px-4 border-b border-gray-200">{item.yil}</td>
                            <td className="py-3 px-4 border-b border-gray-200">{item.pazar_buyuklugu_usd}</td>
                            <td className="py-3 px-4 border-b border-gray-200">
                                {item.cagr_str ? (
                                    <span className="inline-flex items-center">
                                        {item.cagr_str}
                                        {item.aciklama && (
                                            <span className="ml-2 text-sm text-gray-500 italic">
                                                {item.aciklama}
                                            </span>
                                        )}
                                    </span>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// Tip: 'paragraf_ve_maddeli_liste' (Afrika için)
const RenderParagrafVeMaddeliListe = ({ bolumData }) => (
    <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{bolumData.baslikAna}</h2>
        {bolumData.giris_paragrafi_html && <p className="mb-3 text-gray-700" dangerouslySetInnerHTML={{__html: bolumData.giris_paragrafi_html}}/>}
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {bolumData.liste_elemanlari_html.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
        </ul>
    </div>
);

// Tip: 'segment_aciklamalari_liste' (Asya için)
const RenderSegmentAciklamalariListe = ({ bolumData }) => (
    <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{bolumData.baslikAna}</h2>
        <div className="space-y-4">
            {bolumData.segmentler.map((segment, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-gray-800">
                        <span dangerouslySetInnerHTML={{__html: segment.adi_html}} />
                        <span className="ml-1" dangerouslySetInnerHTML={{__html: segment.aciklama_html}}/>
                    </p>
                </div>
            ))}
        </div>
    </div>
);

// Tip: 'ulke_detay_kartlari' (Asya için)
const RenderUlkeDetayKartlari = ({ bolumData }) => (
    <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{bolumData.baslikAna}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bolumData.ulkeler.map(ulke => (
                <div key={ulke.ulke_adi} className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                    <h3 className="text-xl font-semibold text-red-700 mb-3 border-b pb-2 border-red-100">{ulke.ulke_adi}</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        {ulke.detaylar_html.map((detay, i) => (
                            <li key={i} className="pl-2 border-l-2 border-red-200" dangerouslySetInnerHTML={{__html: detay}}/>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    </div>
);

// Tip: 'madde_imleriyle_liste_aciklamali' (Güney Amerika için)
const RenderMaddeImleriyleListeAciklamali = ({ bolumData }) => (
    <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{bolumData.baslikAna}</h2>
        {bolumData.giris_paragrafi_html && <p className="mb-3 text-gray-700 font-medium" dangerouslySetInnerHTML={{ __html: bolumData.giris_paragrafi_html }} />}
        <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-3">
            {bolumData.liste_elemanlari_html.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
        </ul>
        {bolumData.sonuc_paragrafi_html && <p className="text-gray-700 italic" dangerouslySetInnerHTML={{ __html: bolumData.sonuc_paragrafi_html }} />}
    </div>
);

// Tip: 'basit_metin_bloklari_baslikli' (Güney Amerika için)
const RenderBasitMetinBloklariBaslikli = ({ bolumData }) => (
    <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{bolumData.baslikAna}</h2>
        {bolumData.alt_baslik_icerik && <h3 className="text-lg font-semibold text-red-700 mb-2">{bolumData.alt_baslik_icerik}</h3>}
        {bolumData.bloklar_html && bolumData.bloklar_html.map((blok, index) => (
            <p key={index} className="text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: blok }} />
        ))}
    </div>
);

// --- ANA KITA DETAY SAYFASI BİLEŞENİ ---
const ContinentDetailPage = () => {
    const { continentName } = useParams();
    const navigate = useNavigate();
    const [continentData, setContinentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Kıtaya özel başlık ve dosya adı
    const mappedContinentName = continentNameMapping[continentName] || continentName;
    const fileName = continentFileMapping[continentName];

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            setContinentData(null);

            if (!fileName) {
                setError(`Bu kıta için veri dosyası tanımlanmamış: ${mappedContinentName}`);
                setLoading(false);
                return;
            }

            try {
                // Dinamik import
                const dataModule = await import(`../data/${fileName}.json`);
                setContinentData(dataModule.default);
            } catch (err) {
                console.error("Veri yükleme hatası:", err);
                setError(`Veri bulunamadı: ${mappedContinentName} (Dosya: ${fileName}.json)`);
            } finally {
                setLoading(false);
            }
        };

        if (continentName) {
            loadData();
        } else {
            setError("Kıta adı URL'de bulunamadı.");
            setLoading(false);
        }
    }, [continentName]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><div className="text-2xl font-semibold text-gray-700">Yükleniyor...</div></div>;
    }

    if (error) {
        return <div className="flex flex-col justify-center items-center h-screen p-4">
            <div className="text-2xl font-semibold text-red-600 mb-4">Hata</div>
            <p className="text-gray-700 mb-2">{error}</p>
            <p className="text-sm text-gray-500">Detaylı bilgi yüklenemedi: {mappedContinentName}</p>
            <button
                onClick={() => navigate(-1)}
                className="mt-6 px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors flex items-center"
            >
                <FaArrowLeft className="mr-2" /> Geri Dön
            </button>
        </div>;
    }

    if (!continentData) {
        return <div className="min-h-screen pt-16 bg-gray-50 flex justify-center items-center"><p className="text-xl">Kıta bilgisi bulunamadı.</p></div>;
    }

    const isAsiaPacific = continentName === "Asia";

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-red-50 pt-20 pb-12">
            <div className="container mx-auto px-4">
                <button
                    onClick={() => navigate(-1)}
                    className="fixed top-20 left-4 z-50 mb-6 px-4 py-2 bg-white text-primary-600 rounded-full shadow-lg hover:bg-gray-50 transition-colors flex items-center text-sm"
                >
                    <FaArrowLeft className="mr-2" /> Kıtalar Haritasına Geri Dön
                </button>

                <header className="text-center pt-8 pb-8">
                    <h1 className="text-5xl font-extrabold text-gray-800 mb-3">
                        {mappedContinentName} MRO Pazarı Detaylı Analizi
                    </h1>
                    <p className="text-xl text-gray-600">
                        {continentData.ana_baslik_aciklama || `Bu bölümde ${mappedContinentName} kıtasındaki MRO (Bakım, Onarım ve Revizyon) sektörü hakkında kapsamlı bilgiler sunulmaktadır.`}
                    </p>
                </header>

                {/* MROWorldMap Eklendi */}
                <section className="mb-12 bg-white rounded-xl shadow-xl overflow-hidden p-2 md:p-4 border border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 px-2 pt-2">
                        {mappedContinentName} Bölgesindeki MRO Firmaları
                    </h2>
                    <div className="h-[500px] md:h-[600px]"> {/* Harita için yükseklik ayarı */}
                        <MROWorldMap continent={continentName} />
                    </div>
                </section>

                <div className="space-y-10">
                    {continentData.bolumler.map((bolum) => {
                        const IconComponent = sectionIconMapping[bolum.id] || sectionIconMapping.default;
                        let renderSpecificComponent = null;

                        // Hangi render bileşeninin kullanılacağını belirle
                        switch (bolum.tip) {
                            case 'pazar_trendi_tablosu_genel':
                                renderSpecificComponent = <RenderPazarTrendiTablosuGenel bolumData={bolum} />;
                                break;
                            case 'segment_dagilimi_pasta_grafik_genel':
                                renderSpecificComponent = <RenderSegmentDagilimiPastaGrafikGenel bolumData={bolum} />;
                                break;
                            case 'madde_imleriyle_liste':
                                renderSpecificComponent = <RenderMaddeImleriyleListe bolumData={bolum} />;
                                break;
                            case 'basit_metin_bloklari':
                                renderSpecificComponent = <RenderBasitMetinBloklari bolumData={bolum} />;
                                break;
                            case 'yatirim_gerekceleri_detayli':
                                renderSpecificComponent = <RenderYatirimGerekceleriDetayli bolumData={bolum} />;
                                break;
                            case 'pazar_trendi_tablosu_cagr_aciklamali':
                                renderSpecificComponent = <RenderPazarTrendiTablosuCagrAciklamali bolumData={bolum} />;
                                break;
                            case 'paragraf_ve_maddeli_liste':
                                 renderSpecificComponent = <RenderParagrafVeMaddeliListe bolumData={bolum} />;
                                break;
                            case 'segment_aciklamalari_liste':
                                renderSpecificComponent = <RenderSegmentAciklamalariListe bolumData={bolum} />;
                                break;
                            case 'ulke_detay_kartlari':
                                renderSpecificComponent = <RenderUlkeDetayKartlari bolumData={bolum} />;
                                break;
                            case 'madde_imleriyle_liste_aciklamali':
                                renderSpecificComponent = <RenderMaddeImleriyleListeAciklamali bolumData={bolum} />;
                                break;
                            case 'basit_metin_bloklari_baslikli':
                                renderSpecificComponent = <RenderBasitMetinBloklariBaslikli bolumData={bolum} />;
                                break;
                            default:
                                renderSpecificComponent = (
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4">{bolum.baslikAna || "Başlık Yok"}</h2>
                                        <pre className="bg-gray-200 p-3 rounded text-sm overflow-x-auto">
                                            {JSON.stringify(bolum, null, 2)}
                                        </pre>
                                        <p className="text-orange-600 mt-2">Bu bölüm tipi ({bolum.tip}) için özel render bileşeni tanımlanmamış.</p>
                                    </div>
                                );
                        }
                        
                        return (
                            <div key={bolum.id} className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 md:p-8">
                                <div className="flex items-center text-red-600 mb-4 border-b-2 border-red-100 pb-3">
                                   <IconComponent className="text-3xl mr-3" />
                                   <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{bolum.id.replace(/_/g, ' ')}</span>
                                </div>
                                {renderSpecificComponent}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ContinentDetailPage;