import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaExchangeAlt, FaArrowLeft, FaChevronDown, FaSearch, FaChevronUp,
  FaTimes, FaHandshake, FaCogs, FaCertificate, FaPlane, FaMoneyBillWave,
  FaTools, FaUserFriends, FaChartLine, FaCheck, FaInfoCircle, FaBuilding, FaChevronRight
} from 'react-icons/fa';
import { mroFirmalari, turkishTechnicData } from '../data/maintenanceData';
import { MROLogo } from '../utils/logoUtils.jsx';

const TurkishTechnicComparisonPage = () => {
  const navigate = useNavigate();
  const [selectedMRO, setSelectedMRO] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('finansal');
  
  // Filter MROs based on search query
  const filteredMROs = mroFirmalari.filter(mro => 
    mro.mroFirmasiAdi.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle selecting an MRO
  const handleSelectMRO = (mro) => {
    setSelectedMRO(mro);
    setShowDropdown(false);
    setSearchQuery(mro.mroFirmasiAdi);
  };
  
  // Reset selection
  const resetSelection = () => {
    setSelectedMRO(null);
    setSearchQuery('');
  };

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('mro-dropdown');
      if (dropdown && !dropdown.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Comparison tabs
  const tabs = [
    { id: 'finansal', label: 'Finansal Veriler', icon: <FaMoneyBillWave className="mr-2" /> },
    { id: 'kapasite', label: 'Bakım Kapasitesi', icon: <FaChartLine className="mr-2" /> },
    { id: 'hizmetler', label: 'Sunulan Hizmetler', icon: <FaCogs className="mr-2" /> },
    { id: 'ucaklar', label: 'Desteklenen Uçak Tipleri', icon: <FaPlane className="mr-2" /> },
    { id: 'musteriler', label: 'Müşteri Portföyü', icon: <FaHandshake className="mr-2" /> },
    { id: 'altyapi', label: 'Teknik Altyapı', icon: <FaBuilding className="mr-2" /> }
  ];

  // Helper function to count aircraft types
  const countAircraftTypes = (mro) => {
    return Object.values(mro.bakimHizmetiVerilenUcakTipleri || {}).reduce((sum, types) => sum + (types ? types.length : 0), 0);
  };

  const getFinansalKarsilastirma = () => {
    if (!selectedMRO) return null;

    // We know Turkish Technic has financial data for 2023
    const thyFinans = turkishTechnicData.finansalVeriler || [];
    
    // Check if the selected MRO has financial data
    const mroFinans = selectedMRO.finansalVeriler || [];
    
    // Find THY's revenue and profit if available
    let thyGelir = null;
    let thyKar = null;
    let thyCalisan = null;
    
    thyFinans.forEach(item => {
      if (item.includes('Toplam Gelir')) {
        thyGelir = item;
      } else if (item.includes('Operasyonel Kâr')) {
        thyKar = item;
      } else if (item.includes('Çalışan Sayısı')) {
        thyCalisan = item;
      }
    });

    return (
      <div className="space-y-6">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="prose prose-blue">
            <p>
              <strong>Turkish Technic</strong>, 2023 yılında <span className="text-red-600 font-medium">1,86 milyar ABD doları</span> toplam gelir elde ederek 
              güçlü bir finansal performans sergilemiştir. Bu, 2022'ye göre %23'lük bir artışı temsil eder. 
              {selectedMRO.finansalVeriler && selectedMRO.finansalVeriler.length > 0 ? (
                <span> 
                  Buna karşın <strong>{selectedMRO.mroFirmasiAdi}</strong> için detaylı finansal bilgiler mevcut olsa da,
                  doğrudan karşılaştırılabilir rakamlar bulunmamaktadır.
                </span>
              ) : (
                <span>
                  {' '}Buna karşın <strong>{selectedMRO.mroFirmasiAdi}</strong> için finansal veriler yeterince detaylı değildir.
                </span>
              )}
            </p>
            
            {thyKar && (
              <p>
                <strong>Turkish Technic</strong>'in operasyonel kârı 2023 yılında <span className="text-red-600 font-medium">255 milyon ABD doları</span> olarak gerçekleşmiştir, 
                bu da 2022'ye göre %43'lük etkileyici bir artış göstermiştir. Bu, şirketin etkin operasyon yönetimi ve stratejik büyüme inisiyatiflerini yansıtmaktadır.
              </p>
            )}
            
            {thyCalisan && (
              <p>
                <strong>Turkish Technic</strong>, 2023 yılında yaklaşık <span className="text-red-600 font-medium">10.500</span> çalışanı ile 
                sektördeki ana oyunculardan biri olduğunu göstermiştir (2022'ye göre %10 artış).
                {selectedMRO.teknikAltyapi && selectedMRO.teknikAltyapi.some(item => item.includes('Çalışan')) ? (
                  <span> Karşılaştırıldığında, <strong>{selectedMRO.mroFirmasiAdi}</strong>'nin işgücü yapısı farklılıklar göstermektedir.</span>
                ) : null}
              </p>
            )}

            <p className="text-blue-700 mt-4 text-sm">
              <FaInfoCircle className="inline mr-1" />
              Not: Turkish Technic'in finansal büyüme rakamları ve sektördeki konumu önemli bir rekabet avantajı sağlamaktadır.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const getKapasiteKarsilastirma = () => {
    if (!selectedMRO) return null;
    
    const thyKapasite = turkishTechnicData.tahminiYillikBakimKapasitesi || [];
    const mroKapasite = selectedMRO.tahminiYillikBakimKapasitesi || [];

    return (
      <div className="space-y-6">
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
          <div className="prose prose-green">
            <p>
              <strong>Turkish Technic</strong>, 2023 yılında THY için <span className="text-red-600 font-medium">4.212</span> bakım işlemi 
              ve 3. taraf müşteriler için <span className="text-red-600 font-medium">205</span> bakım işlemi gerçekleştirmiştir.
              Toplam <span className="text-red-600 font-medium">4.417</span> bakım işlemiyle etkileyici bir operasyonel kapasite sergilemektedir.
            </p>
            
            <p>
              {mroKapasite.length > 0 ? (
                <span>
                  <strong>{selectedMRO.mroFirmasiAdi}</strong>'nin bakım kapasitesi farklı bir şekilde yapılandırılmıştır 
                  ve kapasite ölçekleri doğrudan karşılaştırılabilir olmayabilir.
                </span>
              ) : (
                <span>
                  <strong>{selectedMRO.mroFirmasiAdi}</strong> için detaylı bakım kapasitesi verileri bulunmamaktadır, 
                  bu da Turkish Technic'in bu alandaki şeffaflığının altını çizmektedir.
                </span>
              )}
            </p>
            
            <p>
              Dikkate değer bir nokta, Turkish Technic'in hem <span className="text-red-600 font-medium">A+L kontrolleri</span> (toplam 4.093), 
              hem <span className="text-red-600 font-medium">C kontrolleri</span> (toplam 209) gibi çeşitli bakım tiplerinde uzmanlaşmış olmasıdır.
            </p>

            <p className="text-green-700 mt-4 text-sm">
              <FaInfoCircle className="inline mr-1" />
              Not: THY için yapılan bakımların yüksek sayısı, operasyonel verimliliği göstermektedir.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const getHizmetlerKarsilastirma = () => {
    if (!selectedMRO) return null;
    
    const thyHizmetler = turkishTechnicData.hizmetleri || [];
    const mroHizmetler = selectedMRO.hizmetleri || [];

    // Find common services
    const commonHizmetler = thyHizmetler.filter(thyHizmet => 
      mroHizmetler.some(mroHizmet => 
        mroHizmet.toLowerCase().includes(thyHizmet.toLowerCase()) || 
        thyHizmet.toLowerCase().includes(mroHizmet.toLowerCase())
      )
    );

    return (
      <div className="space-y-6">
        <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
          <div className="prose prose-purple">
            <p>
              <strong>Turkish Technic</strong>'in sunduğu temel hizmetler arasında 
              <span className="text-red-600 font-medium"> Ağır Bakım (C ve D kontrolleri), Hafif Bakım (A ve L kontrolleri), B ve S kontrolleri, ve Uçak Boyama</span> bulunmaktadır.
            </p>
            
            <p>
              <strong>{selectedMRO.mroFirmasiAdi}</strong> ise 
              <span className="font-medium"> {mroHizmetler.length}</span> farklı hizmet sunmaktadır.
              {mroHizmetler.length > thyHizmetler.length ? 
                " Bu, daha geniş bir hizmet yelpazesine sahip olduklarını göstermektedir." : 
                " Turkish Technic'in hizmet odağı daha spesifik alanlarda yoğunlaşmıştır."}
            </p>
            
            {commonHizmetler.length > 0 && (
              <p>
                Her iki MRO da şu alanlarda hizmet sunmaktadır: 
                <span className="font-medium"> {commonHizmetler.join(", ")}</span>.
                Bu, rekabet halinde oldukları temel hizmet alanlarını göstermektedir.
              </p>
            )}

            <p className="text-purple-700 mt-4 text-sm">
              <FaInfoCircle className="inline mr-1" />
              Not: Turkish Technic'in uzmanlaştığı bakım tipleri, müşterilerine özel değer sunmaktadır.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const getUcaklarKarsilastirma = () => {
    if (!selectedMRO) return null;
    
    const thyUcaklar = turkishTechnicData.bakimHizmetiVerilenUcakTipleri || {};
    const mroUcaklar = selectedMRO.bakimHizmetiVerilenUcakTipleri || {};

    // Count total aircraft types
    const thyUcakSayisi = countAircraftTypes(turkishTechnicData);
    const mroUcakSayisi = countAircraftTypes(selectedMRO);

    // Find common manufacturers
    const commonManufacturers = Object.keys(thyUcaklar).filter(brand => mroUcaklar[brand]);

    return (
      <div className="space-y-6">
        <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200">
          <div className="prose prose-amber">
            <p>
              <strong>Turkish Technic</strong>, toplam <span className="text-red-600 font-medium">{thyUcakSayisi}</span> farklı uçak tipine bakım hizmeti vermektedir.
              Bu, <span className="text-red-600 font-medium">{Object.keys(thyUcaklar).length}</span> farklı üretici firmanın ürünlerini kapsamaktadır 
              (Airbus, Boeing ve diğer üreticiler dahil).
            </p>
            
            <p>
              <strong>{selectedMRO.mroFirmasiAdi}</strong> ise <span className="font-medium">{mroUcakSayisi}</span> farklı uçak tipine hizmet vermektedir.
              {mroUcakSayisi > thyUcakSayisi ? 
                " Bu, daha geniş bir yelpazede uçak tiplerine hizmet verebildiklerini göstermektedir." : 
                " Turkish Technic, desteklenen uçak tipleri açısından daha geniş bir kapsama sahiptir."}
            </p>
            
            {commonManufacturers.length > 0 && (
              <p>
                Her iki şirket de şu üreticilerin uçaklarına bakım hizmeti vermektedir: 
                <span className="font-medium"> {commonManufacturers.join(", ")}</span>.
                {commonManufacturers.includes('Airbus') && commonManufacturers.includes('Boeing') ? 
                  " Bu, her iki firmanın da en yaygın ticari uçak üreticilerine hizmet verebildiğini göstermektedir." : ""}
              </p>
            )}

            <p className="text-amber-700 mt-4 text-sm">
              <FaInfoCircle className="inline mr-1" />
              Not: Turkish Technic'in Boeing ve Airbus ailesine verdiği kapsamlı hizmetler önemli bir rekabet avantajıdır.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const getMusterilerKarsilastirma = () => {
    if (!selectedMRO) return null;
    
    const thyMusteriler = turkishTechnicData.musteriPortfoyu || [];
    const mroMusteriler = selectedMRO.musteriPortfoyu || [];

    return (
      <div className="space-y-6">
        <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
          <div className="prose prose-red">
            <p>
              <strong>Turkish Technic</strong>'in en büyük müşterisi doğal olarak <span className="text-red-600 font-medium">Türk Hava Yolları</span>'dır ve 
              bu durum şirkete istikrarlı bir iş hacmi sağlamaktadır. 2023 yılında THY için 4.212 bakım işlemi gerçekleştirilmiştir.
            </p>
            
            <p>
              Ayrıca Turkish Technic, <span className="text-red-600 font-medium">3. taraf müşteriler</span> için de bakım hizmetleri sunmakta olup, 
              2023'te bu müşteriler için 205 bakım işlemi gerçekleştirmiştir.
            </p>
            
            <p>
              <strong>{selectedMRO.mroFirmasiAdi}</strong>, toplam <span className="font-medium">{mroMusteriler.length}</span> müşteriye hizmet vermektedir.
              {mroMusteriler.length > thyMusteriler.length ? 
                " Bu, daha geniş bir müşteri tabanına sahip olduklarını göstermektedir." : 
                " Turkish Technic'in müşteri odağı daha spesifiktir ve özellikle ana müşterisine yoğunlaşmıştır."}
            </p>

            <p className="text-red-700 mt-4 text-sm">
              <FaInfoCircle className="inline mr-1" />
              Not: THY ile olan güçlü bağ, Turkish Technic'e operasyonel istikrar sağlamaktadır.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const getAltyapiKarsilastirma = () => {
    if (!selectedMRO) return null;
    
    const thyAltyapi = turkishTechnicData.teknikAltyapi || [];
    const mroAltyapi = selectedMRO.teknikAltyapi || [];

    return (
      <div className="space-y-6">
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
          <div className="prose prose-indigo">
            <p>
              <strong>Turkish Technic</strong>'in teknik altyapısında öne çıkan unsur, 2023 yılında 
              <span className="text-red-600 font-medium"> 10.500 çalışanı</span> ile sektördeki en büyük MRO şirketlerinden biri olmasıdır.
              Bu, geniş kapsamlı operasyonlar için gerekli insan kaynağına sahip olduğunu göstermektedir.
            </p>
            
            <p>
              <strong>{selectedMRO.mroFirmasiAdi}</strong>'nin teknik altyapı detayları
              {mroAltyapi.length > 0 ? " farklı odak noktaları içermektedir." : " daha az kapsamlı olarak dokümante edilmiştir."}
            </p>
            
            <p>
              Turkish Technic'in çalışan sayısındaki %10'luk artış (2022-2023), şirketin büyüme stratejisinin bir parçası olarak insan kaynağına yatırım yaptığını göstermektedir.
            </p>

            <p className="text-indigo-700 mt-4 text-sm">
              <FaInfoCircle className="inline mr-1" />
              Not: Turkish Technic'in kapsamlı teknik becerileri ve artan çalışan sayısı, büyüme stratejisinin bir parçasıdır.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderComparisonContent = () => {
    // Analysis sections have been removed as requested
    return null;
  };

  // Get the data sections side by side
  const renderSideBySideComparison = () => {
    if (!selectedMRO) return null;

    // Find the data for both companies according to active tab
    let thyData = [];
    let mroData = [];
    
    switch(activeTab) {
      case 'finansal':
        thyData = turkishTechnicData.finansalVeriler || [];
        mroData = selectedMRO.finansalVeriler || [];
        break;
      case 'kapasite':
        thyData = turkishTechnicData.tahminiYillikBakimKapasitesi || [];
        mroData = selectedMRO.tahminiYillikBakimKapasitesi || [];
        break;
      case 'hizmetler':
        thyData = turkishTechnicData.hizmetleri || [];
        mroData = selectedMRO.hizmetleri || [];
        break;
      case 'musteriler':
        thyData = turkishTechnicData.musteriPortfoyu?.map(m => `${m.havayolu}: ${m.anlasmaDetayi}`) || [];
        mroData = selectedMRO.musteriPortfoyu?.map(m => `${m.havayolu}: ${m.anlasmaDetayi}`) || [];
        break;
      case 'altyapi':
        thyData = turkishTechnicData.teknikAltyapi || [];
        mroData = selectedMRO.teknikAltyapi || [];
        break;
      case 'ucaklar':
        thyData = Object.entries(turkishTechnicData.bakimHizmetiVerilenUcakTipleri || {}).map(([mfr, models]) => 
          `${mfr}: ${models.join(', ')}`);
        mroData = Object.entries(selectedMRO.bakimHizmetiVerilenUcakTipleri || {}).map(([mfr, models]) => 
          `${mfr}: ${models.join(', ')}`);
        break;
    }
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* THY Data */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-red-200 p-4">
          <div className="flex items-center mb-4">
            <div className="w-2 h-8 bg-red-500 rounded-full mr-3"></div>
            <h3 className="text-lg font-bold text-gray-800">Turkish Technic</h3>
          </div>
          <ul className="space-y-2 ml-2">
            {thyData.length > 0 ? (
              thyData.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 mr-2"></span>
                  <span className="text-sm">{item}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500 italic text-sm">Veri bulunmuyor</li>
            )}
          </ul>
        </div>

        {/* Selected MRO Data */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-primary-200 p-4">
          <div className="flex items-center mb-4">
            <div className="w-2 h-8 bg-primary-500 rounded-full mr-3"></div>
            <h3 className="text-lg font-bold text-gray-800">{selectedMRO.mroFirmasiAdi}</h3>
          </div>
          <ul className="space-y-2 ml-2">
            {mroData.length > 0 ? (
              mroData.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 mr-2"></span>
                  <span className="text-sm">{item}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500 italic text-sm">Veri bulunmuyor</li>
            )}
          </ul>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-[calc(100vh-4rem)] pt-16 bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button 
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors text-sm font-medium flex items-center self-start"
              onClick={() => navigate('/mro-comparison')}
            >
              <FaArrowLeft className="mr-1" />
              MRO Karşılaştırma Sayfasına Dön
            </button>
            <div className="flex items-center">
              <FaExchangeAlt className="text-red-600 mr-3 text-xl" />
              <h1 className="text-xl font-bold text-gray-800">
                THY Technic - MRO Karşılaştırma
              </h1>
            </div>
          </div>
        </div>
        
        {/* Company Selection */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* THY Technic Info - Compact */}
            <div className="flex-1 md:border-r md:pr-6 border-gray-200">
              <div className="flex items-center">
                <MROLogo companyName={turkishTechnicData.mroFirmasiAdi} size={52} className="mr-3" />
                <div>
                  <h2 className="font-bold text-red-600">Turkish Technic</h2>
                  <p className="text-xs text-gray-500">Türk Hava Yolları Teknik A.Ş.</p>
                </div>
                <div className="ml-auto flex items-center bg-red-100 text-red-700 rounded-full px-2 py-1 text-xs font-medium">
                  <FaInfoCircle className="mr-1 text-xs" />
                  THY Firması
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center">
                  <FaHandshake className="text-red-600 mr-1 text-sm" />
                  <span className="text-xs">{turkishTechnicData.musteriPortfoyu.length} Müşteri</span>
                </div>
                <div className="flex items-center">
                  <FaCogs className="text-red-600 mr-1 text-sm" />
                  <span className="text-xs">{turkishTechnicData.hizmetleri.length} Hizmet</span>
                </div>
                <div className="flex items-center">
                  <FaPlane className="text-red-600 mr-1 text-sm" />
                  <span className="text-xs">{countAircraftTypes(turkishTechnicData)} Uçak</span>
                </div>
                <div className="flex items-center">
                  <FaMoneyBillWave className="text-red-600 mr-1 text-sm" />
                  <span className="text-xs">1,86 milyar USD</span>
                </div>
              </div>
            </div>
            
            {/* MRO Selection - Compact */}
            <div className="flex-1" id="mro-dropdown">
              {!selectedMRO ? (
                <div>
                  <div className="flex items-center mb-3">
                    <FaExchangeAlt className="text-primary-600 mr-2" />
                    <h3 className="font-medium text-gray-800">Karşılaştırılacak MRO Firması Seçin</h3>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input 
                      type="text"
                      className="w-full p-2 pl-10 pr-8 border border-gray-300 rounded-lg focus:ring focus:ring-primary-500 focus:border-primary-500"
                      placeholder="MRO firma ismi ara..." 
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      onClick={() => setShowDropdown(true)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {searchQuery ? (
                        <button onClick={() => setSearchQuery('')}>
                          <FaTimes className="text-gray-400 hover:text-gray-600" />
                        </button>
                      ) : (
                        <FaChevronDown className="text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Top 5 MROs as quick options */}
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {mroFirmalari.slice(0, 5).map((mro, idx) => (
                        <button 
                          key={idx}
                          className="px-2 py-1 rounded-full text-xs bg-gray-100 hover:bg-primary-50 border border-gray-300 hover:border-primary-300 transition-colors flex items-center"
                          onClick={() => handleSelectMRO(mro)}
                        >
                          <MROLogo companyName={mro.mroFirmasiAdi} size={18} className="mr-1" />
                          <span className="truncate max-w-[80px]">{mro.mroFirmasiAdi}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* MRO Results List */}
                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-1 border border-gray-200 rounded-lg max-h-60 overflow-y-auto bg-white shadow-lg">
                      {filteredMROs.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {filteredMROs.map((mro, index) => (
                            <div 
                              key={index}
                              className="p-2 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-2"
                              onClick={() => handleSelectMRO(mro)}
                            >
                              <MROLogo companyName={mro.mroFirmasiAdi} size={32} />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900">{mro.mroFirmasiAdi}</p>
                                <p className="text-xs text-gray-500 truncate">{(mro.kimdir || "").substring(0, 40)}...</p>
                              </div>
                              <span className="text-primary-500">
                                <FaChevronRight className="text-xs" />
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 text-center text-gray-500 text-sm">Sonuç bulunamadı</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MROLogo companyName={selectedMRO.mroFirmasiAdi} size={42} className="mr-2" />
                      <div>
                        <h3 className="font-medium text-gray-800">{selectedMRO.mroFirmasiAdi}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1">{selectedMRO.kimdir?.substring(0, 60)}...</p>
                      </div>
                    </div>
                    <button 
                      className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      onClick={resetSelection}
                      title="Farklı bir MRO seçin"
                    >
                      <FaTimes className="text-gray-600 text-xs" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center">
                      <FaHandshake className="text-primary-600 mr-1 text-sm" />
                      <span className="text-xs">{selectedMRO.musteriPortfoyu.length} Müşteri</span>
                    </div>
                    <div className="flex items-center">
                      <FaCogs className="text-primary-600 mr-1 text-sm" />
                      <span className="text-xs">{selectedMRO.hizmetleri.length} Hizmet</span>
                    </div>
                    <div className="flex items-center">
                      <FaPlane className="text-primary-600 mr-1 text-sm" />
                      <span className="text-xs">{countAircraftTypes(selectedMRO)} Uçak</span>
                    </div>
                    <div className="flex items-center">
                      <FaCertificate className="text-primary-600 mr-1 text-sm" />
                      <span className="text-xs">{selectedMRO.sertifikalar.length} Sertifika</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Comparison Tabs & Content */}
        {selectedMRO && (
          <>
            {/* Tabs */}
            <div className="flex overflow-x-auto mb-4 bg-white rounded-lg shadow-sm border border-gray-200 sticky top-16 z-10">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`
                    px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center
                    ${activeTab === tab.id
                      ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                      : 'text-gray-600 hover:bg-gray-50'}
                  `}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Content */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                  {tabs.find(tab => tab.id === activeTab)?.label || "Karşılaştırma"} Analizi
                </h2>
                <div className="flex items-center text-sm text-gray-500">
                  <FaInfoCircle className="mr-1" />
                  Karşılaştırmalı Analiz
                </div>
              </div>
              
              {renderSideBySideComparison()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TurkishTechnicComparisonPage; 