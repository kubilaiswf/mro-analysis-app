import React, { useEffect, useState, useMemo } from 'react';
import { FaGlobe, FaInfoCircle, FaBuilding, FaPlane, FaRobot } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SimpleWorldMap from '../components/charts/SimpleWorldMap';
import { mroFirmalari } from '../data/maintenanceData';
import { cityCoordinates, cityToMroMapping } from '../data/cityCoordinates';
import ContinentMap from '../components/charts/ContinentMap';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("HomePage.jsx: Component did mount.");
    console.log("HomePage.jsx: mroFirmalari data:", mroFirmalari);
    
    if (typeof SimpleWorldMap === 'undefined') {
      console.error("HomePage.jsx: SimpleWorldMap is undefined! Check import.");
    } else {
      console.log("HomePage.jsx: SimpleWorldMap component is imported:", SimpleWorldMap);
    }
  }, []);

  console.log("HomePage.jsx: Rendering HomePage component.");

  const handleMROClick = () => {
    navigate('/mro-comparison');
  };

  const handleCustomerClick = () => {
    navigate('/airline-operators');
  };

  const handleAIAssistantClick = () => {
    navigate('/ai-assistant');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-red-25 to-red-50">
      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="flex justify-center">
          <div className="grid md:grid-cols-3 gap-4 max-w-lg w-full">
            <div 
              onClick={handleMROClick}
              className="bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 group border border-red-200 hover:border-red-400"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-1 p-1.5 bg-gradient-to-br from-red-600 to-red-700 rounded-full text-white group-hover:from-red-700 group-hover:to-red-800 transition-all duration-300">
                  <FaBuilding className="text-sm" />
                </div>
                <h3 className="text-xs text-red-800 mb-1 font-semibold">MRO Şirketi</h3>
                <div className="text-red-600 text-xl font-bold group-hover:text-red-700 transition-colors">
                  {mroFirmalari.length}
                </div>
              </div>
            </div>

            <div 
              onClick={handleCustomerClick}
              className="bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 group border border-red-200 hover:border-red-400"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-1 p-1.5 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-white group-hover:from-red-600 group-hover:to-red-700 transition-all duration-300">
                  <FaPlane className="text-sm" />
                </div>
                <h3 className="text-xs text-red-800 mb-1 font-semibold">Müşteri Sayısı</h3>
                <div className="text-red-600 text-xl font-bold group-hover:text-red-700 transition-colors">
                  {mroFirmalari.reduce((total, mro) => 
                    total + (mro.musteriPortfoyu ? mro.musteriPortfoyu.length : 0), 0)}
                </div>
              </div>
            </div>

            <div 
              onClick={handleAIAssistantClick}
              className="bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 group border border-red-200 hover:border-red-400"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative mb-1">
                  <div className="p-1.5 bg-gradient-to-br from-red-700 to-red-800 rounded-full text-white group-hover:from-red-800 group-hover:to-red-900 transition-all duration-300">
                    <FaRobot className="text-sm" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <h3 className="text-xs text-red-800 mb-1 font-semibold">AI Asistan</h3>
                <div className="text-red-600 text-xl font-bold group-hover:text-red-700 transition-colors">
                  Online
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="py-8 pb-16">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-800 pb-6 text-center bg-gradient-to-r from-red-800 to-red-600 bg-clip-text text-transparent">
            MRO Firmalarının Küresel Dağılımı
          </h2>
          <div className="max-w-6xl mx-auto">
            <ContinentMap />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;