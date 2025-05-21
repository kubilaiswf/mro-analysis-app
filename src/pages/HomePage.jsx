import React, { useEffect } from 'react';
import { FaGlobe, FaInfoCircle } from 'react-icons/fa';
import MROWorldMap from '../components/charts/MROWorldMap';
import SimpleWorldMap from '../components/charts/SimpleWorldMap';
import { mroFirmalari } from '../data/maintenanceData';

const HomePage = () => {
  useEffect(() => {
    console.log("HomePage.jsx: Component did mount.");
    console.log("HomePage.jsx: mroFirmalari data:", mroFirmalari);
    
    if (typeof MROWorldMap === 'undefined') {
      console.error("HomePage.jsx: MROWorldMap is undefined! Check import.");
    } else {
      console.log("HomePage.jsx: MROWorldMap component is imported:", MROWorldMap);
    }
    
    if (typeof SimpleWorldMap === 'undefined') {
      console.error("HomePage.jsx: SimpleWorldMap is undefined! Check import.");
    } else {
      console.log("HomePage.jsx: SimpleWorldMap component is imported:", SimpleWorldMap);
    }
  }, []);

  console.log("HomePage.jsx: Rendering HomePage component.");

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-10">
      <div className="container mx-auto p-4">
        {/* İnteraktif Dünya Haritası */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <FaGlobe className="text-primary-500 text-xl mr-2" />
            <h2 className="text-2xl font-semibold text-gray-800">MRO Firma Menşe Ülke Dağılımı</h2>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            {console.log("HomePage.jsx: Rendering MROWorldMap section.")}
            {MROWorldMap ? <MROWorldMap /> : <p>MROWorldMap yüklenemedi!</p>}
          </div>
        </section>
        
        {/* Basit Harita Bölümü */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <FaGlobe className="text-primary-500 text-xl mr-2" />
            <h2 className="text-2xl font-semibold text-gray-800">MRO Küresel Dağılımı (Basit Görünüm)</h2>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-2 border-red-500">
            {console.log("HomePage.jsx: Rendering SimpleWorldMap section.")}
            {SimpleWorldMap ? <SimpleWorldMap /> : <p>SimpleWorldMap yüklenemedi!</p>}
          </div>
        </section>

        {/* MRO İstatistikleri */}
        <section className="mb-10">
          <div className="flex items-center mb-4">
            <FaInfoCircle className="text-primary-500 text-xl mr-2" />
            <h2 className="text-2xl font-semibold text-gray-800">MRO Sektör İstatistikleri</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-primary-500 text-4xl font-bold mb-2">{mroFirmalari.length}</div>
              <div className="text-gray-500">Listedeki MRO Firma Sayısı</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-primary-500 text-4xl font-bold mb-2">
                {mroFirmalari.reduce((total, mro) => 
                  total + (mro.musteriPortfoyu ? mro.musteriPortfoyu.length : 0), 0)}
              </div>
              <div className="text-gray-500">Toplam Müşteri Sayısı</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-primary-500 text-4xl font-bold mb-2">
                {mroFirmalari.reduce((total, mro) => 
                  total + (mro.sertifikalar ? mro.sertifikalar.length : 0), 0)}
              </div>
              <div className="text-gray-500">Toplam Sertifika Sayısı</div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-xs opacity-60">
          ░▒▓█ 0x6b7562696c6169737766 was here █▓▒░
        </div>
      </div>
    </div>
  );
};

export default HomePage;