import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaExchangeAlt, FaFilter, FaTable, FaChartBar, FaPlaneDeparture, 
  FaRegCheckCircle, FaCertificate, FaHandshake, FaInfoCircle, 
  FaMapMarkerAlt, FaPlane, FaUsers, FaFileContract, FaChartLine, 
  FaCogs, FaSync, FaSearch, FaTimes, FaSort, FaSortUp, FaSortDown, 
  FaEye, FaStar, FaStarHalfAlt, FaChevronDown, FaChevronUp, FaArrowLeft,
  FaArrowUp, FaTools, FaChevronRight
} from 'react-icons/fa';
import MROCard from '../components/MROCard';
import MROComparisonTable from '../components/MROComparisonTable';
import TurkishTechnicProfile from '../components/TurkishTechnicProfile';
import { mroFirmalari, turkishTechnicData } from '../data/maintenanceData';
import { formatMRODataForCharts, getCommonAircraftTypes, compareMROsByMetric } from '../utils/mroUtils';
import { MROLogo } from '../utils/logoUtils.jsx';

const MROComparisonPage = () => {
  const navigate = useNavigate();
  
  // MRO şirketleri
  const mroCompanies = mroFirmalari;
  
  // UI kontrolleri için state'ler
  const [showComparison, setShowComparison] = useState(false);
  const [selectedMROs, setSelectedMROs] = useState([]);
  const [comparisonType, setComparisonType] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'mroFirmasiAdi', direction: 'ascending' });
  const [filterOptions, setFilterOptions] = useState({
    minCustomers: 0,
    maxCustomers: 100,
    selectedServices: [],
    selectedCountries: [],
    selectedCapabilities: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;
  
  // Sayfa kaydırıldığında "Yukarı Çık" butonunu göster/gizle
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Sayfa başına kaydır
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Bir MRO seçildiğinde veya seçimi kaldırıldığında
  const toggleMROSelection = (mroIndex) => {
    if (selectedMROs.includes(mroIndex)) {
      setSelectedMROs(selectedMROs.filter(idx => idx !== mroIndex));
    } else {
      setSelectedMROs([...selectedMROs, mroIndex]);
    }
  };
  
  // Seçilen MRO'ları elde et
  const selectedMROCompanies = useMemo(() => 
    selectedMROs.map(index => mroCompanies[index]),
  [selectedMROs, mroCompanies]);
  
  // Tüm MRO'ları seç/kaldır
  const toggleSelectAll = () => {
    if (selectedMROs.length === filteredMROs.length) {
      setSelectedMROs([]);
    } else {
      setSelectedMROs(filteredMROs.map((_, index) => mroCompanies.indexOf(_)));
    }
  };
  
  // Karşılaştırma modunu etkinleştir
  const startComparison = () => {
    if (selectedMROs.length >= 2) {
      setShowComparison(true);
      // Sayfanın en üstüne scroll
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Seçim ekranına dön
  const backToSelection = () => {
    setShowComparison(false);
  };

  // Detay sayfasına git
  const navigateToDetail = (e, index) => {
    e.stopPropagation();
    navigate(`/mro-detail/${index}`);
  };

  // Arama ve filtreleme
  const filteredMROs = useMemo(() => {
    return mroCompanies.filter(company => {
      // Arama filtresi
      const searchFilter = 
        company.mroFirmasiAdi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.kimdir.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Diğer filtreler...
      
      return searchFilter;
    });
  }, [mroCompanies, searchQuery]);

  // Sıralama
  const sortedMROs = useMemo(() => {
    const sortableMROs = [...filteredMROs];
    
    if (sortConfig.key) {
      sortableMROs.sort((a, b) => {
        if (sortConfig.key === 'mroFirmasiAdi') {
          if (a.mroFirmasiAdi < b.mroFirmasiAdi) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a.mroFirmasiAdi > b.mroFirmasiAdi) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        }
        
        if (sortConfig.key === 'customerCount') {
          return sortConfig.direction === 'ascending' 
            ? a.musteriPortfoyu.length - b.musteriPortfoyu.length
            : b.musteriPortfoyu.length - a.musteriPortfoyu.length;
        }
        
        if (sortConfig.key === 'serviceCount') {
          return sortConfig.direction === 'ascending'
            ? a.hizmetleri.length - b.hizmetleri.length
            : b.hizmetleri.length - a.hizmetleri.length;
        }
        
        return 0;
      });
    }
    
    return sortableMROs;
  }, [filteredMROs, sortConfig]);

  // Pagination logic
  const paginatedMROs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedMROs.slice(startIndex, endIndex);
  }, [sortedMROs, currentPage, ITEMS_PER_PAGE]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedMROs.length / ITEMS_PER_PAGE);
  }, [sortedMROs, ITEMS_PER_PAGE]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      scrollToTop(); // Scroll to top when page changes
    }
  };

  // Sıralama yapılandırmasını değiştir
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  return (
    <div className="min-h-[calc(100vh-4rem)] pt-16 bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {!showComparison ? (
          <div>
            {/* New Turkish Technic Compact Banner */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-red-300 mb-6 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center p-4">
                <div className="flex items-center flex-grow">
                  <MROLogo companyName="Turkish Technic" size={150} className="mr-3" />
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-bold text-red-600">THY Technic</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">THY Technic ile diğer MRO firmalarını birebir karşılaştırın</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/thy-comparison')}
                  className="flex items-center px-4 py-2 mt-3 sm:mt-0 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <FaExchangeAlt className="mr-1.5" />
                  THY ile Karşılaştır
                  <FaChevronRight className="ml-1.5" />
                </button>
              </div>
            </div>
            
            {/* Diğer MRO Firmaları Bölümü */}
            <div className="mb-4 mt-6">
              <h2 className="text-2xl font-bold text-gray-800">MRO Firmaları</h2>
              <p className="text-gray-600">Karşılaştırmak istediğiniz MRO firmalarını seçin.</p>
            </div>
            
            {/* Arama ve Filtreleme Kısmı */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                    placeholder="MRO firması ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setSearchQuery('')}
                    >
                      <FaTimes className="text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
             
                <div className="flex">
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-l-lg flex items-center"
                    onClick={() => requestSort('mroFirmasiAdi')}
                  >
                    <span>İsim</span>
                    {sortConfig.key === 'mroFirmasiAdi' ? (
                      sortConfig.direction === 'ascending' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
                    ) : (
                      <FaSort className="ml-1" />
                    )}
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border-l border-gray-200 flex items-center"
                    onClick={() => requestSort('customerCount')}
                  >
                    <span>Müşteri</span>
                    {sortConfig.key === 'customerCount' ? (
                      sortConfig.direction === 'ascending' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
                    ) : (
                      <FaSort className="ml-1" />
                    )}
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-r-lg border-l border-gray-200 flex items-center"
                    onClick={() => requestSort('serviceCount')}
                  >
                    <span>Hizmet</span>
                    {sortConfig.key === 'serviceCount' ? (
                      sortConfig.direction === 'ascending' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
                    ) : (
                      <FaSort className="ml-1" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Filtreler (genişleyebilir/daraltılabilir) */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Filtre kategorileri */}
                  </div>
                </div>
              )}
            </div>

            {/* Seçim İşlemleri */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">MRO Şirketleri</h2>
                  <p className="text-gray-600 text-sm">Karşılaştırmak istediğiniz şirketleri seçin (en az 2)</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg">
                    <span className="text-gray-700 font-medium mr-2">{selectedMROs.length}</span>
                    <span className="text-gray-500 text-sm">seçildi</span>
                  </div>
                  
                  <button 
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors text-sm font-medium"
                    onClick={toggleSelectAll}
                  >
                    {selectedMROs.length === filteredMROs.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* MRO Kartları - Daha iyi grid yapısıyla */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {paginatedMROs.map((company, index) => {
                const originalIndex = mroCompanies.indexOf(company);
                return (
                  <div 
                    key={originalIndex} 
                    className={`
                      bg-white rounded-lg shadow-sm overflow-hidden border transition-all duration-200 cursor-pointer
                      h-auto flex flex-col
                      ${selectedMROs.includes(originalIndex) 
                        ? 'border-primary-500 shadow-md ring-2 ring-primary-100' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }
                    `}
                    onClick={() => toggleMROSelection(originalIndex)}
                  >
                    {/* Kart Başlığı */}
                    <div className="relative p-3 flex-grow">
                      {/* Seçim İşaretçisi */}
                      <div 
                        className={`
                          absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center overflow-hidden transition-colors
                          ${selectedMROs.includes(originalIndex) 
                            ? 'bg-primary-500 text-white' 
                            : 'border border-gray-300 bg-white'
                          }
                        `}
                      >
                        {selectedMROs.includes(originalIndex) && (
                          <FaRegCheckCircle className="text-white text-xs" />
                        )}
                      </div>
                      
                      {/* Firma Bilgileri */}
                      <div className="pr-6 flex items-start gap-3">
                        <MROLogo companyName={company.mroFirmasiAdi} size={100} />
                        <div className="max-w-[70%]">
                          <h3 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2 overflow-hidden break-words">{company.mroFirmasiAdi}</h3>
                          
                          {/* İstatistikler - Revised Layout */}
                          <div className="space-y-1 mt-1">
                            <div className="flex items-center text-xs text-gray-600">
                              <FaHandshake className="text-primary-500 mr-1 w-3 h-3" />
                              <span className="font-medium mr-1">{company.musteriPortfoyu.length}</span>
                              <span className="text-xs">Müşteri</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <FaCertificate className="text-primary-500 mr-1 w-3 h-3" />
                              <span className="font-medium mr-1">{company.sertifikalar.length}</span>
                              <span className="text-xs">Sertifika</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <FaCogs className="text-primary-500 mr-1 w-3 h-3" />
                              <span className="font-medium mr-1">{company.hizmetleri.length}</span>
                              <span className="text-xs">Hizmet</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Kart Alt Kısmı - Eylemler */}
                    <div className={`
                      py-2 px-4 border-t flex justify-between items-center text-xs
                      ${selectedMROs.includes(originalIndex) ? 'bg-primary-50 border-primary-100' : 'bg-gray-50 border-gray-100'}
                    `}>
                      <button 
                        className="text-primary-600 hover:text-primary-800 font-medium flex items-center"
                        onClick={(e) => navigateToDetail(e, originalIndex)}
                      >
                        <FaInfoCircle className="mr-1" /> 
                        Detay
                      </button>
                      
                      <span className="font-medium">
                        {selectedMROs.includes(originalIndex) ? 'Seçildi' : 'Seç'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8 mb-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                {[...Array(totalPages).keys()].map(num => (
                  <button
                    key={num + 1}
                    onClick={() => handlePageChange(num + 1)}
                    className={`px-4 py-2 rounded-lg ${currentPage === num + 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {num + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            )}
            
            {/* Sonuç Bulunamadı */}
            {sortedMROs.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FaSearch className="text-gray-400 text-xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Sonuç Bulunamadı</h3>
                <p className="text-gray-500 mb-6">Arama kriterlerinize uygun MRO firması bulunamadı.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowFilters(false);
                    setFilterOptions({
                      minCustomers: 0,
                      maxCustomers: 100,
                      selectedServices: [],
                      selectedCountries: [],
                      selectedCapabilities: []
                    });
                  }}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <FaSync className="mr-2" />
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Karşılaştırma Başlık */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button 
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors text-sm font-medium flex items-center self-start sm:self-center order-first sm:order-none mb-2 sm:mb-0 sm:mr-4"
                  onClick={backToSelection}
                >
                  <FaArrowLeft className="mr-1" />
                  Seçime Dön
                </button>
                <div className="flex items-center">
                  <FaExchangeAlt className="text-primary-600 mr-3 text-xl" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      MRO Karşılaştırması
                      <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        {selectedMROs.length} firma
                      </span>
                    </h2>
                  </div>
                </div>
                <div className="hidden sm:block sm:flex-grow"></div>
              </div>
            </div>
            
            {/* Firma İsimleri Chip'leri */}
            <div className="flex flex-wrap gap-2">
              {selectedMROCompanies.map((company, idx) => (
                <div key={idx} className="bg-white rounded-full border border-primary-200 px-2 py-1 flex items-center shadow-sm">
                  <MROLogo companyName={company.mroFirmasiAdi} size={32} className="mr-2" />
                  <span className="text-sm font-medium text-gray-800">{company.mroFirmasiAdi}</span>
                </div>
              ))}
            </div>
            
            {/* Karşılaştırma Sonuçları */}
            <div id="comparison-results">
              <MROComparisonTable mroCompanies={selectedMROCompanies} />
            </div>
            
            {/* Özet bilgiler - Daha görsel ve kompakt */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaChartBar className="mr-2 text-primary-600" />
                  Karşılaştırma Özeti
                </h3>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                    <div className="flex flex-col items-center">
                      <FaHandshake className="text-primary-500 text-xl mb-2" />
                      <p className="text-xs text-gray-600 text-center mb-1">En fazla müşteriye sahip</p>
                      <h4 className="text-base font-bold text-primary-700 text-center">
                        {[...selectedMROCompanies].sort((a, b) => b.musteriPortfoyu.length - a.musteriPortfoyu.length)[0].mroFirmasiAdi}
                      </h4>
                      <p className="text-sm font-medium text-primary-600 text-center">
                        {[...selectedMROCompanies].sort((a, b) => b.musteriPortfoyu.length - a.musteriPortfoyu.length)[0].musteriPortfoyu.length} müşteri
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                    <div className="flex flex-col items-center">
                      <FaTools className="text-primary-500 text-xl mb-2" />
                      <p className="text-xs text-gray-600 text-center mb-1">En fazla hizmet sunan</p>
                      <h4 className="text-base font-bold text-primary-700 text-center">
                        {[...selectedMROCompanies].sort((a, b) => b.hizmetleri.length - a.hizmetleri.length)[0].mroFirmasiAdi}
                      </h4>
                      <p className="text-sm font-medium text-primary-600 text-center">
                        {[...selectedMROCompanies].sort((a, b) => b.hizmetleri.length - a.hizmetleri.length)[0].hizmetleri.length} hizmet
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                    <div className="flex flex-col items-center">
                      <FaPlane className="text-primary-500 text-xl mb-2" />
                      <p className="text-xs text-gray-600 text-center mb-1">Toplam desteklenen uçak tipleri</p>
                      <h4 className="text-base font-bold text-primary-700 text-center">
                        {selectedMROCompanies.reduce((total, mro) => {
                          return total + Object.values(mro.bakimHizmetiVerilenUcakTipleri).reduce((sum, models) => sum + models.length, 0);
                        }, 0)} model
                      </h4>
                      <p className="text-sm font-medium text-primary-600 text-center">
                        {Object.keys(selectedMROCompanies.reduce((acc, mro) => {
                          Object.keys(mro.bakimHizmetiVerilenUcakTipleri).forEach(brand => {
                            acc[brand] = true;
                          });
                          return acc;
                        }, {})).length} marka
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Ekranı takip eden karşılaştırma butonu - Artık bounce animasyonu olmadan ve sağ altta */}
        {!showComparison && selectedMROs.length >= 2 && (
          <div className="fixed bottom-6 right-6 z-50 transition-opacity duration-300 ease-in-out">
            <button
              onClick={startComparison}
              className="flex items-center px-5 py-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors font-medium"
              aria-label={`${selectedMROs.length} MRO'yu karşılaştır`}
            >
              <span className="absolute -bottom-2 -right-2 w-6 h-6 bg-accent-900 text-white rounded-full text-xs flex items-center justify-center">
                {selectedMROs.length}
              </span>
              <FaExchangeAlt className="mr-2" />
              Karşılaştır
            </button>
          </div>
        )}
        
        {/* Yukarı Çık butonu */}
        {showScrollTop && (
          <div className="fixed bottom-6 left-6 z-50 transition-opacity duration-300 ease-in-out">
            <button
              onClick={scrollToTop}
              className="flex items-center justify-center w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
              aria-label="Yukarı çık"
            >
              <FaArrowUp />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MROComparisonPage; 