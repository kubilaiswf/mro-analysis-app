import React, { useState } from 'react';
import { FaCheck, FaTimes, FaPlane, FaCertificate, FaHandshake, FaTools, FaIndustry, FaMapMarkerAlt, FaBuilding, FaChartBar, FaChevronDown, FaChevronUp, FaInfoCircle, FaSortAmountDown, FaSortAmountUp, FaSort } from 'react-icons/fa';
import { prepareMROComparisonTable } from '../utils/mroUtils';
import { MROLogo } from '../utils/logoUtils.jsx';

const MROComparisonTable = ({ mroCompanies }) => {
  const { headers, rows } = prepareMROComparisonTable(mroCompanies);
  const [expandedMetric, setExpandedMetric] = useState(null);
  const [sortOrders, setSortOrders] = useState({
    'Müşteri Sayısı': 'desc',
    'Hizmet Sayısı': 'desc',
    'Sertifika Sayısı': 'desc',
    'Tesis Sayısı': 'desc',
    'Desteklenen Uçak Tipleri': 'desc'
  });
  
  if (mroCompanies.length <= 1) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <div className="w-16 h-16 flex items-center justify-center mx-auto bg-primary-50 rounded-full mb-4">
          <FaChartBar className="text-primary-500 text-2xl" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Karşılaştırma İçin Firma Seçin</h3>
        <p className="text-gray-600 max-w-md mx-auto">Karşılaştırma yapmak için en az iki MRO firması seçmelisiniz.</p>
      </div>
    );
  }
  
  // Ana metrikler ve bunların ikonları
  const mainMetrics = [
    { key: 'Müşteri Sayısı', icon: <FaHandshake className="text-primary-500" />, description: 'Firmanın hizmet verdiği toplam havayolu müşterisi sayısını gösterir. Yüksek müşteri sayısı, firmanın sektördeki deneyimini ve güvenilirliğini ifade eder.' },
    { key: 'Hizmet Sayısı', icon: <FaTools className="text-primary-500" />, description: 'Firmanın sağladığı bakım, onarım ve revizyon hizmetlerinin toplam sayısını ifade eder. Çeşitli hizmetler sunan MRO\'lar daha kapsamlı çözümler sağlayabilir.' },
    { key: 'Sertifika Sayısı', icon: <FaCertificate className="text-primary-500" />, description: 'Firmanın sahip olduğu uluslararası ve yerel kalite, güvenlik ve standart sertifikalarının sayısıdır. Daha fazla sertifika, daha yüksek güvenilirlik ve kalite standartları anlamına gelir.' },
    { key: 'Tesis Sayısı', icon: <FaBuilding className="text-primary-500" />, description: 'Firmanın dünya genelinde sahip olduğu bakım ve hizmet tesislerinin sayısını gösterir. Daha fazla tesis, daha geniş bir coğrafi kapsamaya ve daha hızlı hizmet sunabilme kapasitesine işaret eder.' },
    { key: 'Desteklenen Uçak Tipleri', icon: <FaPlane className="text-primary-500" />, description: 'Firmanın bakım, onarım ve revizyon hizmetleri sunduğu uçak tiplerinin toplam sayısıdır. Daha fazla çeşitlilik, daha geniş bir müşteri tabanına hizmet verebilme kapasitesini gösterir.' }
  ];
  
  // Metrikleri belirten renk skalası
  const getColorClass = (value, maxValue) => {
    const percentage = (value / maxValue) * 100;
    if (percentage < 25) return 'bg-red-50 border-red-200 text-red-700';
    if (percentage < 50) return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    if (percentage < 75) return 'bg-blue-50 border-blue-200 text-blue-700';
    return 'bg-green-50 border-green-200 text-green-700';
  };
  
  // Renk sınıfları için farklı stiller
  const getProgressColorClass = (value, maxValue) => {
    const percentage = (value / maxValue) * 100;
    if (percentage < 25) return 'bg-red-500';
    if (percentage < 50) return 'bg-yellow-500';
    if (percentage < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };
  
  // Metrik ve firma bazında veri seti oluştur
  const metricData = {};
  mainMetrics.forEach(metric => {
    const metricIndex = rows.findIndex(row => row[0] === metric.key);
    if (metricIndex !== -1) {
      metricData[metric.key] = {
        values: mroCompanies.map((company, idx) => ({ 
          company: company.mroFirmasiAdi, 
          value: rows[metricIndex][idx + 1] 
        })),
        max: Math.max(...rows[metricIndex].slice(1))
      };
    }
  });
  
  // Metrik genişlet/daralt
  const toggleMetric = (metricKey) => {
    if (expandedMetric === metricKey) {
      setExpandedMetric(null);
    } else {
      setExpandedMetric(metricKey);
    }
  };
  
  // Sıralama yönünü değiştir (artan, azalan, varsayılan)
  const toggleSort = (metricKey) => {
    setSortOrders(prevState => ({
      ...prevState,
      [metricKey]: prevState[metricKey] === 'desc' ? 'asc' : 'desc'
    }));
  };
  
  // Verileri sırala
  const sortValues = (values, sortOrder) => {
    if (!values || values.length === 0) return [];
    
    return [...values].sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.value - a.value; // Yüksekten düşüğe
      } else {
        return a.value - b.value; // Düşükten yükseğe
      }
    });
  };
  
  return (
    <div className="space-y-5">
      {mainMetrics.map((metric) => (
        metricData[metric.key] && (
          <div key={metric.key} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div 
              className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
              onClick={() => toggleMetric(metric.key)}
            >
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="mr-3 text-primary-600">{metric.icon}</span>
                {metric.key}
              </h3>
              <div className="flex items-center">
                <button className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                  {expandedMetric === metric.key ? (
                    <FaChevronUp className="transition-transform duration-200" />
                  ) : (
                    <FaChevronDown className="transition-transform duration-200" />
                  )}
                </button>
              </div>
            </div>
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
              expandedMetric === metric.key ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <FaInfoCircle className="text-primary-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{metric.description}</p>
      </div>
      
                  <div className="flex items-center ml-4">
                    <span className="text-xs text-gray-500 mr-2">Sırala:</span>
                    <button 
                      onClick={() => toggleSort(metric.key)}
                      className="flex items-center justify-center px-2 py-1 rounded text-xs bg-white hover:bg-gray-100 border border-gray-200"
                    >
                      {sortOrders[metric.key] === 'desc' ? (
                        <>
                          <FaSortAmountDown className="mr-1.5 text-primary-500" />
                          <span>En Yüksek</span>
                        </>
                      ) : (
                        <>
                          <FaSortAmountUp className="mr-1.5 text-primary-500" />
                          <span>En Düşük</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortValues(metricData[metric.key].values, sortOrders[metric.key]).map((item, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${getColorClass(item.value, metricData[metric.key].max)}`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <MROLogo companyName={item.company} size={32} className="mr-2" />
                        <h4 className="font-semibold text-gray-800">{item.company}</h4>
                      </div>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold">{item.value}</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                      <div 
                        className={`h-2.5 rounded-full ${getProgressColorClass(item.value, metricData[metric.key].max)}`}
                        style={{ width: `${Math.max(5, (item.value / metricData[metric.key].max) * 100)}%` }}
                      ></div>
                    </div>
                    
                    {/* Her metrik için özel açıklama ve görsel */}
                    {metric.key === 'Müşteri Sayısı' && (
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 rounded-full bg-primary-500 mr-2"></div>
                        <span>Sektör ortalaması: {Math.round(metricData[metric.key].values.reduce((sum, val) => sum + val.value, 0) / metricData[metric.key].values.length)}</span>
                      </div>
                    )}
                    
                    {metric.key === 'Hizmet Sayısı' && (
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 rounded-full bg-primary-500 mr-2"></div>
                        <span>Sektör ortalaması: {Math.round(metricData[metric.key].values.reduce((sum, val) => sum + val.value, 0) / metricData[metric.key].values.length)}</span>
                      </div>
                    )}
                    
                    {metric.key === 'Sertifika Sayısı' && (
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 rounded-full bg-primary-500 mr-2"></div>
                        <span>Sektör ortalaması: {Math.round(metricData[metric.key].values.reduce((sum, val) => sum + val.value, 0) / metricData[metric.key].values.length)}</span>
                      </div>
                    )}
                    
                    {metric.key === 'Tesis Sayısı' && (
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 rounded-full bg-primary-500 mr-2"></div>
                        <span>Sektör ortalaması: {Math.round(metricData[metric.key].values.reduce((sum, val) => sum + val.value, 0) / metricData[metric.key].values.length)}</span>
                      </div>
                    )}
                    
                    {metric.key === 'Desteklenen Uçak Tipleri' && (
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 rounded-full bg-primary-500 mr-2"></div>
                        <span>Sektör ortalaması: {Math.round(metricData[metric.key].values.reduce((sum, val) => sum + val.value, 0) / metricData[metric.key].values.length)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {metric.key === 'Müşteri Sayısı' && (
                <div className="mt-5 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <FaChartBar className="mr-2 text-primary-500" />
                      Müşteri Portföyü Analizi
                    </h4>
                    
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-2">Sıralama:</span>
                      <button 
                        onClick={() => toggleSort('Müşteri Sayısı')}
                        className="flex items-center justify-center px-2 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200"
                        title={sortOrders['Müşteri Sayısı'] === 'desc' ? 'Yüksekten düşüğe sıralı' : 'Düşükten yükseğe sıralı'}
                      >
                        {sortOrders['Müşteri Sayısı'] === 'desc' ? (
                          <>
                            <FaSortAmountDown className="mr-1 text-primary-500" />
                            <span>En Yüksek</span>
                          </>
                        ) : (
                          <>
                            <FaSortAmountUp className="mr-1 text-primary-500" />
                            <span>En Düşük</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 border border-gray-200 rounded mb-2">
                    <div className="grid grid-cols-1 gap-2">
                      {sortValues(metricData[metric.key].values, sortOrders[metric.key]).map((item, index) => {
                        const percentage = Math.max(5, (item.value / metricData[metric.key].max) * 100);
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-24 md:w-32 text-sm font-medium text-gray-700 truncate">
                              {item.company}
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-5 overflow-hidden">
                              <div 
                                className={`h-full ${getProgressColorClass(item.value, metricData[metric.key].max)}`} 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="w-8 text-sm font-semibold text-right">
                              {item.value}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    * Grafik, firmaların müşteri sayılarını karşılaştırmalı olarak göstermektedir.
                  </div>
                  
                  {/* Renk kodları açıklaması */}
                  <div className="flex flex-wrap items-center mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center mr-4 mb-1">
                      <span className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></span>
                      <span className="text-xs text-gray-600">Yüksek (75-100%)</span>
                    </div>
                    <div className="flex items-center mr-4 mb-1">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-1.5"></span>
                      <span className="text-xs text-gray-600">Orta-Yüksek (50-75%)</span>
                    </div>
                    <div className="flex items-center mr-4 mb-1">
                      <span className="w-3 h-3 rounded-full bg-yellow-500 mr-1.5"></span>
                      <span className="text-xs text-gray-600">Orta (25-50%)</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <span className="w-3 h-3 rounded-full bg-red-500 mr-1.5"></span>
                      <span className="text-xs text-gray-600">Düşük (0-25%)</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Benzer yatay bar grafiği formatı diğer metrikler için de gerekli mi? */}
              {metric.key === 'Hizmet Sayısı' && sortValues(metricData[metric.key].values, sortOrders[metric.key]).length > 0 && (
                <div className="mt-5 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <FaChartBar className="mr-2 text-primary-500" />
                      Hizmet Dağılımı Analizi
                    </h4>
                    
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-2">Sıralama:</span>
                      <button 
                        onClick={() => toggleSort('Hizmet Sayısı')}
                        className="flex items-center justify-center px-2 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200"
                        title={sortOrders['Hizmet Sayısı'] === 'desc' ? 'Yüksekten düşüğe sıralı' : 'Düşükten yükseğe sıralı'}
                      >
                        {sortOrders['Hizmet Sayısı'] === 'desc' ? (
                          <>
                            <FaSortAmountDown className="mr-1 text-primary-500" />
                            <span>En Yüksek</span>
                          </>
                        ) : (
                          <>
                            <FaSortAmountUp className="mr-1 text-primary-500" />
                            <span>En Düşük</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 border border-gray-200 rounded">
                    <div className="grid grid-cols-1 gap-2">
                      {sortValues(metricData[metric.key].values, sortOrders[metric.key]).map((item, index) => {
                        const percentage = Math.max(5, (item.value / metricData[metric.key].max) * 100);
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-24 md:w-32 text-sm font-medium text-gray-700 truncate">
                              {item.company}
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-5 overflow-hidden">
                              <div 
                                className={`h-full ${getProgressColorClass(item.value, metricData[metric.key].max)}`} 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="w-8 text-sm font-semibold text-right">
                              {item.value}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    * Grafik, firmaların sunduğu hizmet sayılarını karşılaştırmalı olarak göstermektedir.
                  </div>
      </div>
              )}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default MROComparisonTable; 