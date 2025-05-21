import React, { useState, useEffect } from 'react';
import { Marker } from 'react-simple-maps';
import { FaPlane, FaTools, FaBuilding, FaCertificate, FaUserTie } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const MROLocationMarker = ({ coordinates, mroData, onMarkerClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [pulse, setPulse] = useState(false);
  
  // Create a pulsing effect
  useEffect(() => {
    const timer = setInterval(() => {
      setPulse(prev => !prev);
    }, 1500);
    
    return () => clearInterval(timer);
  }, []);

  const handleMarkerClick = () => {
    onMarkerClick(mroData);
  };
  
  // Pick a color based on MRO services to make different types of MROs visually distinct
  const getMarkerColor = () => {
    if (!mroData || !mroData.hizmetleri) return '#FF5722'; // Default orange
    
    const services = mroData.hizmetleri.join(' ').toLowerCase();
    
    if (services.includes('motor')) return '#2196F3'; // Blue for engine services
    if (services.includes('komponent') || services.includes('component')) return '#FF9800'; // Orange for component services
    if (services.includes('hat bakım') || services.includes('line')) return '#4CAF50'; // Green for line maintenance
    if (services.includes('modifikasyon') || services.includes('modification')) return '#9C27B0'; // Purple for modifications
    if (services.includes('kabin') || services.includes('cabin')) return '#F44336'; // Red for cabin
    
    return '#FF5722'; // Default orange
  };
  
  const color = getMarkerColor();
  const pulseSize = pulse ? (isHovered ? 12 : 10) : (isHovered ? 10 : 8);

  return (
    <Marker coordinates={coordinates}>
      <g
        transform="translate(-12, -24)"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleMarkerClick}
        style={{ cursor: 'pointer' }}
      >
        {/* Outer pulse circle */}
        <circle
          r={pulseSize}
          fill={`rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.3)`}
          className="transition-all duration-300"
        />
        
        {/* Main marker circle */}
        <circle
          r={isHovered ? 6 : 5}
          fill={isHovered ? color : color}
          stroke="#FFFFFF"
          strokeWidth={2}
          className="transition-all duration-200"
        />
        
        {/* Inner highlight */}
        <circle
          r={2}
          fill="#FFFFFF"
          opacity={0.6}
          className="transition-all duration-200"
        />
        
        {/* Label that shows on hover */}
        {isHovered && (
          <>
            {/* Background for better readability */}
            <rect
              x={-60}
              y={10}
              width={120}
              height={20}
              rx={4}
              fill="rgba(255, 255, 255, 0.9)"
              stroke={color}
              strokeWidth={1}
            />
            
            {/* MRO name text */}
            <text
              textAnchor="middle"
              y={24}
              fill="#333333"
              fontSize={10}
              fontWeight="bold"
              style={{
                pointerEvents: 'none'
              }}
            >
              {mroData.mroFirmasiAdi}
            </text>
          </>
        )}
      </g>
    </Marker>
  );
};

const MRODetailsPopup = ({ mro, onClose }) => {
  if (!mro) return null;
  
  // Animation states for entry
  const [showContent, setShowContent] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Set animation after render
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get total customer count
  const customerCount = mro.musteriPortfoyu ? mro.musteriPortfoyu.length : 0;
  
  // Get aircraft types count
  const aircraftTypesCount = 
    mro.bakimHizmetiVerilenUcakTipleri ? 
      Object.entries(mro.bakimHizmetiVerilenUcakTipleri).reduce(
        (acc, [_, models]) => acc + models.length, 0
      ) : 0;

  // Get financial info if available
  const financialInfo = mro.finansalBilgiler || {};
  
  // Get maintenance capabilities if available
  const maintenanceCapabilities = mro.bakimKapasitesi || {};

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" 
      onClick={onClose}
      style={{ 
        backdropFilter: 'blur(3px)',
        transition: 'all 0.3s ease-in-out',
        opacity: showContent ? 1 : 0
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-4xl w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{ 
          transform: showContent ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-5 relative">
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-200 focus:outline-none transition-colors duration-150"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold mb-1">{mro.mroFirmasiAdi}</h2>
          <div className="flex items-center gap-4">
            <p className="opacity-90 flex items-center">
              <FaBuilding className="mr-2" />
              {mro.hangarVeTesisKonumlari && mro.hangarVeTesisKonumlari[0]?.konum}
            </p>
            {mro.kurulusYili && (
              <p className="opacity-90 text-sm">
                <span className="text-white text-opacity-70">Kuruluş: </span>
                {mro.kurulusYili}
              </p>
            )}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button 
              className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'text-primary-600 border-b-2 border-primary-600 bg-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('overview')}
            >
              Genel Bilgiler
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'services' ? 'text-primary-600 border-b-2 border-primary-600 bg-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('services')}
            >
              Hizmetler
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'customers' ? 'text-primary-600 border-b-2 border-primary-600 bg-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('customers')}
            >
              Müşteriler
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'capabilities' ? 'text-primary-600 border-b-2 border-primary-600 bg-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('capabilities')}
            >
              Kapasiteler
            </button>
          </div>
        </div>
        
        <div className="p-5">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* MRO Summary Stats */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">
                    {mro.sertifikalar?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Sertifika</div>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg text-center border border-green-100">
                  <div className="text-2xl font-bold text-green-600">
                    {customerCount}
                  </div>
                  <div className="text-sm text-gray-600">Müşteri</div>
                </div>
                
                <div className="bg-orange-50 p-3 rounded-lg text-center border border-orange-100">
                  <div className="text-2xl font-bold text-orange-600">
                    {aircraftTypesCount}
                  </div>
                  <div className="text-sm text-gray-600">Uçak Modeli</div>
                </div>
                
                <div className="bg-purple-50 p-3 rounded-lg text-center border border-purple-100">
                  <div className="text-2xl font-bold text-purple-600">
                    {mro.hangarVeTesisKonumlari?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Tesis</div>
                </div>
              </div>
              
              {/* Company description */}
              <div className="mb-5">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Şirket Hakkında</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border-l-4 border-primary-500">{mro.kimdir}</p>
              </div>
              
              {/* Certificate section */}
              <div className="mb-5">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Sertifikalar</h3>
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {mro.sertifikalar?.map((sertifika, idx) => (
                      <div 
                        key={idx} 
                        className="px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm border border-blue-200 transition-colors"
                      >
                        {sertifika}
                      </div>
                    ))}
                    {!mro.sertifikalar || mro.sertifikalar.length === 0 && (
                      <p className="text-gray-500 italic">Sertifika bilgisi bulunamadı.</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Financial info if available */}
              {financialInfo && Object.keys(financialInfo).length > 0 && (
                <div className="mb-5">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Finansal Bilgiler</h3>
                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      {financialInfo.yillikCiro && (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                          <div className="text-sm text-gray-600">Yıllık Ciro</div>
                          <div className="text-lg font-bold text-green-600">{financialInfo.yillikCiro}</div>
                        </div>
                      )}
                      {financialInfo.calismaSayisi && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <div className="text-sm text-gray-600">Çalışan Sayısı</div>
                          <div className="text-lg font-bold text-blue-600">{financialInfo.calismaSayisi}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Services Tab */}
          {activeTab === 'services' && (
            <>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Sunulan Hizmetler</h3>
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-5">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {mro.hizmetleri?.map((hizmet, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="mt-1 mr-2 text-green-500">✓</div>
                      <span>{hizmet}</span>
                    </li>
                  ))}
                  {!mro.hizmetleri || mro.hizmetleri.length === 0 && (
                    <p className="text-gray-500 italic">Hizmet bilgisi bulunamadı.</p>
                  )}
                </ul>
              </div>
              
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Bakım Yapılan Uçak Tipleri</h3>
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mro.bakimHizmetiVerilenUcakTipleri && 
                    Object.entries(mro.bakimHizmetiVerilenUcakTipleri).map(([uretici, modeller]) => (
                      <div key={uretici} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-700 mb-2">{uretici}</h4>
                        <div className="flex flex-wrap gap-1">
                          {modeller.map((model, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white text-xs rounded border border-gray-300">
                              {model}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  }
                  {!mro.bakimHizmetiVerilenUcakTipleri || Object.keys(mro.bakimHizmetiVerilenUcakTipleri).length === 0 && (
                    <p className="text-gray-500 italic">Uçak tipi bilgisi bulunamadı.</p>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Müşteri Portföyü</h3>
              {mro.musteriPortfoyu && mro.musteriPortfoyu.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Havayolu
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ülke
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Anlaşma Detayı
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mro.musteriPortfoyu.map((musteri, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {musteri.havayolu}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {musteri.ulke || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {musteri.anlasmaDetayi || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 italic">Müşteri bilgisi bulunamadı.</p>
              )}
            </>
          )}
          
          {/* Capabilities Tab */}
          {activeTab === 'capabilities' && (
            <>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Tesis ve Hangarlar</h3>
              {mro.hangarVeTesisKonumlari && mro.hangarVeTesisKonumlari.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  {mro.hangarVeTesisKonumlari.map((tesis, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                      <h4 className="font-medium text-gray-800 mb-1">{tesis.konum}</h4>
                      <p className="text-sm text-gray-600 mb-2">{tesis.tesisDetayi || "Genel MRO tesisi"}</p>
                      {tesis.alanBilgisi && (
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="mr-2">Alan:</span>
                          <span className="font-medium">{tesis.alanBilgisi}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic mb-5">Tesis bilgisi bulunamadı.</p>
              )}
              
              {/* Maintenance Capacity */}
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Bakım Kapasitesi</h3>
              {maintenanceCapabilities && Object.keys(maintenanceCapabilities).length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(maintenanceCapabilities).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-700 mb-1">{key}</h4>
                        <div className="text-sm text-gray-600">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">Kapasite bilgisi bulunamadı.</p>
              )}
            </>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
            <button 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Kapat
            </button>
            
            <Link 
              to={`/mro-detail/${encodeURIComponent(mro.mroFirmasiAdi)}`}
              className="bg-primary-600 text-white px-5 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center"
            >
              Detaylı Bilgi
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export { MROLocationMarker, MRODetailsPopup };
