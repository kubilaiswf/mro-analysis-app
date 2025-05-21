import React from 'react';
import { FaChartPie, FaChartLine, FaBuilding } from 'react-icons/fa';

const RegionInfoPanel = ({ continentInfo }) => {
  if (!continentInfo) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white px-5 py-4">
        <h3 className="text-xl font-semibold">{continentInfo.title}</h3>
      </div>
      
      <div className="p-5">
        <p className="text-gray-700 mb-4">{continentInfo.description}</p>
        
        <div className="grid grid-cols-3 gap-4 mb-2">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center text-primary-500 mb-1">
              <FaChartPie className="text-lg" />
            </div>
            <div className="text-xl font-bold text-gray-800">{continentInfo.stats.marketShare}</div>
            <div className="text-xs text-gray-500">Küresel Pazar Payı</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center text-green-500 mb-1">
              <FaChartLine className="text-lg" />
            </div>
            <div className="text-xl font-bold text-gray-800">{continentInfo.stats.growth}</div>
            <div className="text-xs text-gray-500">Yıllık Büyüme</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center text-blue-500 mb-1">
              <FaBuilding className="text-lg" />
            </div>
            <div className="text-xl font-bold text-gray-800">{continentInfo.stats.leadingCompanies}</div>
            <div className="text-xs text-gray-500">Lider Şirket</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionInfoPanel;
