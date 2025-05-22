import React, { useState, useMemo } from 'react';
import { 
  FaPlane, FaMapMarkerAlt, FaHandshake, FaCertificate, FaCogs, 
  FaIndustry, FaBuilding, FaChartLine, FaFileContract, FaUsers, 
  FaInfoCircle, FaTasks, FaChevronRight, FaChevronDown
} from 'react-icons/fa';
import { MROLogo } from '../utils/logoUtils.jsx';

const MROCard = ({ mroData }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState('');

  // Toggle a section's expanded state
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection('');
    } else {
      setExpandedSection(section);
    }
  };

  // Tab headers
  const tabs = [
    { id: 'overview', label: 'Genel Bilgi', icon: <FaInfoCircle className="mr-1.5" /> },
    { id: 'services', label: 'Hizmetler', icon: <FaCogs className="mr-1.5" /> },
    { id: 'customers', label: 'Müşteriler', icon: <FaHandshake className="mr-1.5" /> },
    { id: 'capabilities', label: 'Kapasiteler', icon: <FaTasks className="mr-1.5" /> },
    { id: 'facilities', label: 'Tesisler', icon: <FaBuilding className="mr-1.5" /> },
  ];

  // Havayolu listesi limiti
  const AIRLINE_LIMIT = 3;

  // Havayollarını filtrelenmiş olarak getir
  const topAirlines = useMemo(() => {
    if (!mroData.musteriPortfoyu || !Array.isArray(mroData.musteriPortfoyu)) {
      return [];
    }
    return mroData.musteriPortfoyu.slice(0, AIRLINE_LIMIT);
  }, [mroData.musteriPortfoyu]);

  // Toplam havayolu sayısı
  const totalAirlines = mroData.musteriPortfoyu ? mroData.musteriPortfoyu.length : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col h-full">
      {/* Company Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-4 text-white">
        <div className="flex items-center">
          <MROLogo companyName={mroData.mroFirmasiAdi} size={64} className="mr-3" />
          <h2 className="text-xl font-bold">{mroData.mroFirmasiAdi}</h2>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto bg-gray-50 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap flex items-center ${
              activeTab === tab.id
                ? 'border-b-2 border-primary-500 bg-white text-primary-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 flex-grow overflow-y-auto">
        {activeTab === 'overview' && (
          <div>
            <div className="text-gray-700 mb-4 text-sm">
              <p className="leading-relaxed">{mroData.kimdir.length > 250 ? `${mroData.kimdir.substring(0, 250)}...` : mroData.kimdir}</p>
            </div>
            
            <div 
              className={`border rounded-lg overflow-hidden mb-4 ${expandedSection === 'customers' ? 'border-primary-200' : 'border-gray-200'}`}
            >
              <div 
                className={`flex justify-between items-center px-4 py-3 cursor-pointer ${
                  expandedSection === 'customers' ? 'bg-primary-50' : 'bg-gray-50'
                }`}
                onClick={() => toggleSection('customers')}
              >
                <div className="flex items-center">
                  <FaHandshake className={`mr-2 ${expandedSection === 'customers' ? 'text-primary-500' : 'text-gray-500'}`} />
                  <h3 className="font-medium text-gray-800">Müşteri Havayolları</h3>
                </div>
                <div>
                  {expandedSection === 'customers' ? (
                    <FaChevronDown className="text-gray-500" />
                  ) : (
                    <FaChevronRight className="text-gray-500" />
                  )}
                </div>
              </div>
              
              {expandedSection === 'customers' && (
                <div className="p-4 border-t border-gray-200">
                  <div className="space-y-2">
                    {topAirlines.map((airline, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-md p-2.5 flex items-center">
                        <FaPlane className="text-primary-400 mr-2" />
                        <div>
                          <span className="font-medium text-gray-800">{airline.havayolu}</span>
                          <div className="text-xs text-gray-500 mt-0.5 flex items-center">
                            <FaMapMarkerAlt className="mr-1" />
                            {airline.ulke}, {airline.merkezSehir}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {totalAirlines > AIRLINE_LIMIT && (
                      <div className="text-center text-sm text-primary-600">
                        +{totalAirlines - AIRLINE_LIMIT} müşteri daha...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div 
              className={`border rounded-lg overflow-hidden mb-4 ${expandedSection === 'certs' ? 'border-primary-200' : 'border-gray-200'}`}
            >
              <div 
                className={`flex justify-between items-center px-4 py-3 cursor-pointer ${
                  expandedSection === 'certs' ? 'bg-primary-50' : 'bg-gray-50'
                }`}
                onClick={() => toggleSection('certs')}
              >
                <div className="flex items-center">
                  <FaCertificate className={`mr-2 ${expandedSection === 'certs' ? 'text-primary-500' : 'text-gray-500'}`} />
                  <h3 className="font-medium text-gray-800">Sertifikalar ({mroData.sertifikalar.length})</h3>
                </div>
                <div>
                  {expandedSection === 'certs' ? (
                    <FaChevronDown className="text-gray-500" />
                  ) : (
                    <FaChevronRight className="text-gray-500" />
                  )}
                </div>
              </div>
              
              {expandedSection === 'certs' && (
                <div className="p-4 border-t border-gray-200">
                  <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                    {mroData.sertifikalar.map((sertifika, idx) => (
                      <li key={idx} className="text-sm text-gray-600">{sertifika}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div 
              className={`border rounded-lg overflow-hidden ${expandedSection === 'aircraft' ? 'border-primary-200' : 'border-gray-200'}`}
            >
              <div 
                className={`flex justify-between items-center px-4 py-3 cursor-pointer ${
                  expandedSection === 'aircraft' ? 'bg-primary-50' : 'bg-gray-50'
                }`}
                onClick={() => toggleSection('aircraft')}
              >
                <div className="flex items-center">
                  <FaPlane className={`mr-2 ${expandedSection === 'aircraft' ? 'text-primary-500' : 'text-gray-500'}`} />
                  <h3 className="font-medium text-gray-800">Uçak Tipleri</h3>
                </div>
                <div>
                  {expandedSection === 'aircraft' ? (
                    <FaChevronDown className="text-gray-500" />
                  ) : (
                    <FaChevronRight className="text-gray-500" />
                  )}
                </div>
              </div>
              
              {expandedSection === 'aircraft' && (
                <div className="p-4 border-t border-gray-200">
                  <div className="space-y-3">
                    {Object.entries(mroData.bakimHizmetiVerilenUcakTipleri).map(([marka, modeller]) => (
                      <div key={marka} className="bg-gray-50 p-3 rounded-md">
                        <h4 className="font-medium text-primary-600 mb-1">{marka}</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {modeller.map((model, idx) => (
                            <span key={idx} className="inline-flex items-center text-xs bg-primary-50 text-primary-700 rounded-full px-2 py-1">
                              {model}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaCogs className="mr-2 text-primary-600" />
              Sunulan Hizmetler
            </h3>
            <div className="space-y-1.5">
              {mroData.hizmetleri.map((hizmet, idx) => (
                <div key={idx} className="bg-gray-50 rounded-md p-3 text-gray-700 text-sm">
                  {hizmet}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaHandshake className="mr-2 text-primary-600" />
              Müşteri Portföyü
            </h3>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Havayolu</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ülke</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anlaşma</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mroData.musteriPortfoyu.map((musteri, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 text-sm text-gray-900">{musteri.havayolu}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{musteri.ulke}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{musteri.anlasmaDetayi || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'facilities' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaBuilding className="mr-2 text-primary-600" />
              Hangar ve Tesis Konumları
            </h3>
            <div className="space-y-3">
              {mroData.hangarVeTesisKonumlari.map((tesis, idx) => (
                <div key={idx} className="bg-gray-50 rounded-md p-3 border border-gray-200">
                  <h4 className="font-medium text-primary-600 flex items-center">
                    <FaMapMarkerAlt className="mr-1.5 text-primary-500" />
                    {tesis.konum}
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">{tesis.detay}</p>
                </div>
              ))}
            </div>
            
            <h3 className="font-semibold text-gray-800 mt-6 mb-3 flex items-center">
              <FaIndustry className="mr-2 text-primary-600" />
              Teknik Altyapı
            </h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {mroData.teknikAltyapi.map((altyapi, idx) => (
                <li key={idx} className="text-sm">{altyapi}</li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'capabilities' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaTasks className="mr-2 text-primary-600" />
              Tahmini Yıllık Bakım Kapasitesi
            </h3>
            <div className="space-y-1.5 mb-6">
              {mroData.tahminiYillikBakimKapasitesi.map((kapasite, idx) => (
                <div key={idx} className="bg-gray-50 rounded-md p-3 text-gray-700 text-sm">
                  {kapasite}
                </div>
              ))}
            </div>
            
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaChartLine className="mr-2 text-primary-600" />
              Son Dönemdeki Yatırımlar
            </h3>
            <div className="space-y-1.5 mb-6">
              {mroData.sonDonemdekiYatirimlar.map((yatirim, idx) => (
                <div key={idx} className="bg-gray-50 rounded-md p-3 text-gray-700 text-sm">
                  {yatirim}
                </div>
              ))}
            </div>
            
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaFileContract className="mr-2 text-primary-600" />
              Anlaşmalar
            </h3>
            <div className="space-y-1.5">
              {mroData.anlasmalar.map((anlasma, idx) => (
                <div key={idx} className="bg-gray-50 rounded-md p-3 text-gray-700 text-sm">
                  {anlasma}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MROCard; 