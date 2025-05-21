import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AirlineOperatorCard from '../components/AirlineOperatorCard';
import { mroFirmalari } from '../data/maintenanceData';
import { FaSearch, FaFilter, FaGlobe, FaPlane, FaHome, FaArrowRight } from 'react-icons/fa';

const AirlineOperatorsPage = () => {
  // Tüm havayollarını topla
  const allAirlines = useMemo(() => {
    const airlinesMap = new Map();
    
    // Tüm MRO firmalarından havayollarını toplayalım
    mroFirmalari.forEach(mro => {
      if (mro.musteriPortfoyu && Array.isArray(mro.musteriPortfoyu)) {
        mro.musteriPortfoyu.forEach(musteri => {
          const airlineKey = musteri.havayolu;
          
          if (!airlinesMap.has(airlineKey)) {
            airlinesMap.set(airlineKey, {
              ...musteri,
              agreements: []
            });
          }
          
          // Anlaşmayı havayoluna ekle
          airlinesMap.get(airlineKey).agreements.push({
            mroFirmaAdi: mro.mroFirmasiAdi,
            anlasmaDetayi: musteri.anlasmaDetayi
          });
        });
      }
    });
    
    return Array.from(airlinesMap.values());
  }, []);
  
  // Filtreler
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  
  // Ülkeler listesi
  const countries = useMemo(() => {
    const uniqueCountries = new Set(allAirlines.map(airline => airline.ulke));
    return Array.from(uniqueCountries).sort();
  }, [allAirlines]);
  
  // Filtrelenmiş havayolları
  const filteredAirlines = useMemo(() => {
    return allAirlines.filter(airline => {
      // Arama sorgusuna göre filtrele
      const matchesSearch = searchQuery === '' || 
        airline.havayolu.toLowerCase().includes(searchQuery.toLowerCase()) ||
        airline.merkezSehir.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Ülkeye göre filtrele
      const matchesCountry = selectedCountry === '' || airline.ulke === selectedCountry;
      
      return matchesSearch && matchesCountry;
    });
  }, [allAirlines, searchQuery, selectedCountry]);
  
  // Filtreleri temizle
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCountry('');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Üst Başlık ve Ana Menü Butonu */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 flex items-center">
            <FaPlane className="text-primary-600 mr-2" />
            Havayolu Operatörleri
          </h1>
          <Link to="/" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
            <FaHome className="mr-2" />
            Ana Menü
          </Link>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Sayfa Açıklaması */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
              <FaPlane size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Havayolu Operatörleri</h2>
              <p className="text-gray-600">
                Tüm MRO şirketlerinin çalıştığı havayolu operatörlerini görüntüleyin. Her havayolu operatörü için mevcut anlaşmaları ve detayları inceleyebilirsiniz.
              </p>
            </div>
          </div>
        </div>
        
        {/* Filtreleme Kısmı */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                placeholder="Havayolu veya şehir ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaGlobe className="text-gray-400" />
              </div>
              <select
                className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                <option value="">Tüm Ülkeler</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            
            {(searchQuery || selectedCountry) && (
              <button
                onClick={clearFilters}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center text-gray-500">
              <FaFilter className="mr-2 text-primary-600" />
              <span>{filteredAirlines.length} havayolu operatörü gösteriliyor</span>
            </div>
            
            <Link
              to="/mro-comparison"
              className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center"
            >
              MRO Karşılaştırma Sayfasına Git
              <FaArrowRight className="ml-1" />
            </Link>
          </div>
        </div>
        
        {/* Havayolu Kartları */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAirlines.map((airline, index) => (
            <AirlineOperatorCard 
              key={index} 
              airline={airline} 
              agreements={airline.agreements} 
            />
          ))}
          
          {filteredAirlines.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-lg shadow-sm border border-gray-200">
              <FaPlane className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-500">Aranan kriterlere uygun havayolu bulunamadı</h3>
              <p className="text-gray-400 mt-2 mb-6">Lütfen farklı bir arama terimi deneyin veya filtreleri temizleyin</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AirlineOperatorsPage; 