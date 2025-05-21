import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaCogs, FaCertificate, FaHandshake, FaInfoCircle, FaPlane, 
  FaMapMarkerAlt, FaFileContract, FaUsers, FaChartLine, FaPlaneDeparture, 
  FaToolbox, FaIndustry, FaMoneyBillWave, FaWrench, FaTasks, FaFileSignature, 
  FaLightbulb, FaBuilding 
} from 'react-icons/fa';
import { mroFirmalari } from '../data/maintenanceData';
import { MROLogo } from '../utils/logoUtils.jsx';

const MRODetailPage = () => {
  const { mroId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hizmetler'); // Default tab
  const [company, setCompany] = useState(null);

  useEffect(() => {
    // mroId'ye göre şirket bilgilerini bul
    const foundCompany = mroFirmalari.find((mro, index) => index.toString() === mroId);
    
    if (foundCompany) {
      setCompany(foundCompany);
    } else {
      // Şirket bulunamadıysa listeye geri dön
      navigate('/mro-comparison');
    }
  }, [mroId, navigate]);

  if (!company) {
    return (
      <div className="min-h-[calc(100vh-4rem)] pt-16 bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderList = (title, items, icon) => {
    if (!items || items.length === 0) return <p className="text-gray-500">Bu konuda bilgi bulunmamaktadır.</p>;
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          {icon && React.createElement(icon, { className: "mr-2 text-primary-600" })}
          {title}
        </h3>
        <ul className="list-disc pl-6 space-y-1">
          {items.map((item, idx) => (
            <li key={idx} className="text-gray-700">{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderKeyValueList = (title, dataObject, icon) => {
    if (!dataObject || Object.keys(dataObject).length === 0) return <p className="text-gray-500">Bu konuda bilgi bulunmamaktadır.</p>;
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          {icon && React.createElement(icon, { className: "mr-2 text-primary-600" })}
          {title}
        </h3>
        <ul className="list-disc pl-6 space-y-1">
          {Object.entries(dataObject).map(([key, value], idx) => (
            <li key={idx} className="text-gray-700">
              <strong className="font-medium">{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const tabConfig = [
    { id: 'hizmetler', label: 'Hizmetler', icon: FaCogs },
    { id: 'sertifikalar', label: 'Sertifikalar', icon: FaCertificate },
    { id: 'musteriler', label: 'Müşteriler', icon: FaHandshake },
    { id: 'operasyonel', label: 'Operasyonel Detaylar', icon: FaTasks },
    { id: 'finans_teknik', label: 'Finans & Teknik', icon: FaIndustry },
    { id: 'hakkinda', label: 'Hakkında', icon: FaInfoCircle },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-16 bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Başlık ve Geri Dön Butonu */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <MROLogo companyName={company.mroFirmasiAdi} size={128} className="border border-gray-200" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{company.mroFirmasiAdi} Detayları</h1>
                <p className="text-gray-600 mt-1">{company.kimdir.split('.')[0]}.</p>
              </div>
            </div>
            <button 
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => navigate('/mro-comparison')}
            >
              <FaArrowLeft className="mr-2" />
              Karşılaştırma Listesine Dön
            </button>
          </div>
        </div>

        {/* Yeni Layout: Sol Tarafta Sekmeler, Ortada İçerik */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="flex flex-col md:flex-row">
            {/* Sol Taraftaki Sekmeler */}
            <div className="md:w-64 bg-gray-50 border-r border-gray-200 md:min-h-[600px]">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-700">Bilgi Kategorileri</h3>
              </div>
              <nav className="p-2">
                {tabConfig.map(tab => (
                  <button 
                    key={tab.id}
                    className={`w-full flex items-center px-4 py-3 rounded-md text-sm font-medium mb-1 transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="mr-2" /> {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Ortadaki İçerik */}
            <div className="flex-1 p-6">
              {activeTab === 'hizmetler' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {renderList("Sunulan Hizmetler", company.hizmetleri, FaWrench)}
                </div>
              )}
              
              {activeTab === 'sertifikalar' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {renderList("Sertifikalar ve Yetkiler", company.sertifikalar, FaCertificate)}
                </div>
              )}
              
              {activeTab === 'musteriler' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <FaHandshake className="mr-2 text-primary-600" /> Müşteri Portföyü
                  </h3>
                  {company.musteriPortfoyu && company.musteriPortfoyu.length > 0 ? (
                      <div className="space-y-4">
                      {company.musteriPortfoyu.map((musteri, idx) => (
                          <div key={idx} className="bg-gray-50 p-4 rounded-md border border-gray-200 hover:shadow-sm transition-shadow">
                          <div className="flex items-center mb-2">
                              <FaPlane className="text-primary-500 mr-2" />
                              <h4 className="font-semibold text-gray-900 text-md">{musteri.havayolu}</h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm pl-6">
                              <div className="flex items-center text-gray-600">
                              <FaMapMarkerAlt className="text-gray-400 mr-2 flex-shrink-0" />
                              <span><strong>Ülke:</strong> {musteri.ulke || "-"}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                              <FaToolbox className="text-gray-400 mr-2 flex-shrink-0" />
                              <span><strong>Merkez:</strong> {musteri.merkezSehir || "-"}</span>
                              </div>
                              <div className="flex items-center text-gray-600 col-span-full">
                              <FaFileContract className="text-gray-400 mr-2 flex-shrink-0" />
                              <span><strong>Anlaşma Detayı:</strong> {musteri.anlasmaDetayi || "-"}</span>
                              </div>
                          </div>
                          </div>
                      ))}
                      </div>
                  ) : (
                      <p className="text-gray-500">Bu konuda bilgi bulunmamaktadır.</p>
                  )}
                  </div>
              )}

              {activeTab === 'operasyonel' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      {renderKeyValueList("Bakım Yapılan Uçak Tipleri", company.bakimHizmetiVerilenUcakTipleri, FaPlaneDeparture)}
                      {renderList("Tahmini Yıllık Bakım Kapasitesi", company.tahminiYillikBakimKapasitesi, FaTasks)}
                      {renderList("Son Dönemdeki Yatırımlar", company.sonDonemdekiYatirimlar, FaLightbulb)}
                  </div>
              )}

              {activeTab === 'finans_teknik' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      {renderList("Finansal Veriler", company.finansalVeriler, FaMoneyBillWave)}
                      {renderList("Anlaşmalar", company.anlasmalar, FaFileSignature)}
                      {renderList("Teknik Altyapı", company.teknikAltyapi, FaBuilding)}
                  </div>
              )}
              
              {activeTab === 'hakkinda' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Şirket Bilgileri</h3>
                    <p className="text-gray-700 leading-relaxed">{company.kimdir}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {company.hangarVeTesisKonumlari && company.hangarVeTesisKonumlari.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <FaMapMarkerAlt className="text-primary-600 mr-2" />
                          Tesis Konumları
                        </h4>
                        <ul className="text-gray-700 list-disc pl-5">
                          {company.hangarVeTesisKonumlari.map((tesis, idx) => (
                            <li key={idx}>{tesis.konum}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {company.bakimHizmetiVerilenUcakTipleri && Object.keys(company.bakimHizmetiVerilenUcakTipleri).length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <FaPlaneDeparture className="text-primary-600 mr-2" />
                          Bakım Yapılan Uçak Tipleri
                        </h4>
                        <ul className="text-gray-700 list-disc pl-5">
                          {Object.entries(company.bakimHizmetiVerilenUcakTipleri).map(([marka, modeller], idx) => (
                            <li key={idx}><strong>{marka}:</strong> {modeller.join(', ')}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MRODetailPage; 