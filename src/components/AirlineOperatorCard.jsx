import React, { useState } from 'react';
import { FaPlane, FaMapMarkerAlt, FaCalendarAlt, FaHandshake, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const AirlineOperatorCard = ({ airline, agreements }) => {
  const [expanded, setExpanded] = useState(false);

  // Sıralama fonksiyonu - en son anlaşmalar üstte olacak
  const sortedAgreements = [...agreements].sort((a, b) => {
    // Anlaşma detayındaki yılı çıkarma (Örnek: "... (2024)" formatından)
    const yearA = a.anlasmaDetayi && a.anlasmaDetayi.match(/\((\d{4})\)/) ? 
                 parseInt(a.anlasmaDetayi.match(/\((\d{4})\)/)[1]) : 0;
    const yearB = b.anlasmaDetayi && b.anlasmaDetayi.match(/\((\d{4})\)/) ? 
                 parseInt(b.anlasmaDetayi.match(/\((\d{4})\)/)[1]) : 0;
    return yearB - yearA; // Yılları azalan sırada sırala
  });

  // İlk 2 anlaşma veya tümü (genişletilmişse)
  const displayedAgreements = expanded ? sortedAgreements : sortedAgreements.slice(0, 2);
  const hasMoreAgreements = sortedAgreements.length > 2;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
      {/* Havayolu Başlığı */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-5 text-white">
        <h2 className="text-xl font-bold">{airline.havayolu}</h2>
        <div className="flex items-center text-sm mt-2 space-x-4">
          <div className="flex items-center">
            <FaMapMarkerAlt className="mr-1 text-primary-200" />
            <span>{airline.ulke}</span>
          </div>
          <div className="h-4 w-px bg-primary-300"></div>
          <div className="flex items-center">
            <span>{airline.merkezSehir}</span>
          </div>
        </div>
      </div>

      {/* Anlaşma Özeti */}
      <div className="bg-primary-50 px-5 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-primary-700">
            <FaHandshake className="mr-2" />
            <span className="font-medium">
              {agreements.length} MRO Anlaşması
            </span>
          </div>
          {sortedAgreements.length > 0 && sortedAgreements[0].anlasmaDetayi && (
            <div className="flex items-center text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
              <FaCalendarAlt className="mr-1" />
              <span>
                En son: {sortedAgreements[0].anlasmaDetayi.match(/\((\d{4})\)/) 
                  ? sortedAgreements[0].anlasmaDetayi.match(/\((\d{4})\)/)[1] 
                  : 'N/A'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Anlaşma Detayları */}
      <div className="p-5">
        <div className="space-y-3">
          {displayedAgreements.map((agreement, idx) => {
            // Anlaşma detayı null olabilir, kontrol et
            if (!agreement.anlasmaDetayi) {
              return (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{agreement.mroFirmaAdi}</div>
                      <p className="text-gray-500 text-sm mt-1">Anlaşma detayı belirtilmemiş</p>
                    </div>
                  </div>
                </div>
              );
            }
            
            // Yıl bilgisini ayıklama
            const yearMatch = agreement.anlasmaDetayi.match(/\((\d{4})\)/);
            const year = yearMatch ? yearMatch[1] : null;
            
            // Uçak tipini ayıklama
            const aircraftMatch = agreement.anlasmaDetayi.match(/([AB]\d{3}[a-zA-Z]*(?:\/[a-zA-Z]*)?|B7\d{2}[a-zA-Z]*(?:\/[a-zA-Z]*)?)/);
            const aircraftType = aircraftMatch ? aircraftMatch[0] : null;
            
            return (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{agreement.mroFirmaAdi}</div>
                    <p className="text-gray-700 text-sm mt-1">{agreement.anlasmaDetayi}</p>
                  </div>
                  {year && (
                    <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {year}
                    </span>
                  )}
                </div>
                
                {aircraftType && (
                  <div className="mt-2 flex items-center">
                    <FaPlane className="text-gray-400 mr-1" size={12} />
                    <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded">
                      {aircraftType}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Daha Fazla/Az Göster Butonu */}
        {hasMoreAgreements && (
          <button 
            className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <FaChevronUp className="mr-2" />
                Daha Az Göster
              </>
            ) : (
              <>
                <FaChevronDown className="mr-2" />
                {sortedAgreements.length - 2} Anlaşma Daha Göster
              </>
            )}
          </button>
        )}
        
        {sortedAgreements.length === 0 && (
          <div className="text-gray-500 text-center py-6 flex flex-col items-center">
            <FaHandshake className="text-gray-300 mb-2" size={24} />
            <p>Bu havayolu için kayıtlı anlaşma bulunmamaktadır.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AirlineOperatorCard; 