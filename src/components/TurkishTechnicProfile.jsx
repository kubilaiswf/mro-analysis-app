import React, { useState } from 'react';
import { 
  FaPlane, FaMapMarkerAlt, FaHandshake, FaCertificate, FaCogs, 
  FaIndustry, FaBuilding, FaChartLine, FaFileContract, FaUsers, 
  FaInfoCircle, FaTasks, FaChevronRight, FaChevronDown, FaMoneyBillWave
} from 'react-icons/fa';
import { MROLogo } from '../utils/logoUtils.jsx';

const TurkishTechnicProfile = ({ turkishTechnicData }) => {
  const [expandedSection, setExpandedSection] = useState('');

  // Toggle a section's expanded state
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection('');
    } else {
      setExpandedSection(section);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden mb-6">
      {/* Company Header - Special THY styling */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
        <div className="flex items-center gap-4">
          <MROLogo companyName={turkishTechnicData.mroFirmasiAdi} size={120} className="mr-4" />
          <div>
            <h2 className="text-2xl font-bold mb-1">{turkishTechnicData.mroFirmasiAdi}</h2>
            <p className="opacity-90 text-sm">Türk Hava Yolları Teknik A.Ş.</p>
            <div className="flex items-center mt-3 bg-white bg-opacity-20 rounded-md px-3 py-1 w-fit">
              <FaInfoCircle className="mr-2" />
              <span className="text-sm font-medium">THY Çalışma Firması</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="p-6 grid gap-4">
        {/* Hizmetler */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
            onClick={() => toggleSection('hizmetler')}
          >
            <div className="flex items-center">
              <FaCogs className="text-red-600 mr-3" />
              <h3 className="font-semibold text-gray-800">Bakım Tipleri ve Hizmetler</h3>
            </div>
            {expandedSection === 'hizmetler' ? (
              <FaChevronDown className="text-gray-500" />
            ) : (
              <FaChevronRight className="text-gray-500" />
            )}
          </div>
          
          {expandedSection === 'hizmetler' && (
            <div className="p-4 border-t border-gray-200">
              <ul className="grid gap-2">
                {turkishTechnicData.hizmetleri.map((hizmet, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 mt-1.5 mr-2"></span>
                    <span>{hizmet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Finansal Veriler */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
            onClick={() => toggleSection('finansal')}
          >
            <div className="flex items-center">
              <FaMoneyBillWave className="text-red-600 mr-3" />
              <h3 className="font-semibold text-gray-800">2023 Finansal Verileri</h3>
            </div>
            {expandedSection === 'finansal' ? (
              <FaChevronDown className="text-gray-500" />
            ) : (
              <FaChevronRight className="text-gray-500" />
            )}
          </div>
          
          {expandedSection === 'finansal' && (
            <div className="p-4 border-t border-gray-200">
              <ul className="grid gap-3">
                {turkishTechnicData.finansalVeriler.map((veri, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 mt-1.5 mr-2"></span>
                    <span>{veri}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Bakım Kapasitesi */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
            onClick={() => toggleSection('kapasite')}
          >
            <div className="flex items-center">
              <FaChartLine className="text-red-600 mr-3" />
              <h3 className="font-semibold text-gray-800">Bakım Kapasitesi (2023)</h3>
            </div>
            {expandedSection === 'kapasite' ? (
              <FaChevronDown className="text-gray-500" />
            ) : (
              <FaChevronRight className="text-gray-500" />
            )}
          </div>
          
          {expandedSection === 'kapasite' && (
            <div className="p-4 border-t border-gray-200">
              <ul className="grid gap-3">
                {turkishTechnicData.tahminiYillikBakimKapasitesi.map((kapasite, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 mt-1.5 mr-2"></span>
                    <span>{kapasite}</span>
                  </li>
                ))}
                <li className="flex items-start font-medium text-gray-700 mt-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 mt-1.5 mr-2"></span>
                  <span>Toplam Bakım (THY + 3. Taraf): 4.417</span>
                </li>
              </ul>
            </div>
          )}
        </div>
        
        {/* Bakım Yapılan Uçak Tipleri */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
            onClick={() => toggleSection('ucaklar')}
          >
            <div className="flex items-center">
              <FaPlane className="text-red-600 mr-3" />
              <h3 className="font-semibold text-gray-800">Bakım Hizmeti Verilen Uçak Tipleri</h3>
            </div>
            {expandedSection === 'ucaklar' ? (
              <FaChevronDown className="text-gray-500" />
            ) : (
              <FaChevronRight className="text-gray-500" />
            )}
          </div>
          
          {expandedSection === 'ucaklar' && (
            <div className="p-4 border-t border-gray-200">
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(turkishTechnicData.bakimHizmetiVerilenUcakTipleri).map(([manufacturer, models]) => (
                  <div key={manufacturer} className="border border-gray-200 rounded-md p-3">
                    <h4 className="font-medium text-gray-700 mb-2">{manufacturer}</h4>
                    <ul className="text-gray-600">
                      {models.map((model, idx) => (
                        <li key={idx} className="text-sm mb-1 flex items-center">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5"></span>
                          {model}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Müşteriler */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
            onClick={() => toggleSection('musteriler')}
          >
            <div className="flex items-center">
              <FaHandshake className="text-red-600 mr-3" />
              <h3 className="font-semibold text-gray-800">Müşteri Portföyü</h3>
            </div>
            {expandedSection === 'musteriler' ? (
              <FaChevronDown className="text-gray-500" />
            ) : (
              <FaChevronRight className="text-gray-500" />
            )}
          </div>
          
          {expandedSection === 'musteriler' && (
            <div className="p-4 border-t border-gray-200">
              <ul className="grid gap-2">
                {turkishTechnicData.musteriPortfoyu.map((musteri, index) => (
                  <li key={index} className="p-3 border border-gray-200 rounded-md">
                    <div className="font-medium text-gray-800">{musteri.havayolu}</div>
                    <div className="text-sm text-gray-600 mt-1">{musteri.anlasmaDetayi}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TurkishTechnicProfile; 