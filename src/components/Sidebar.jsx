import React from 'react';
import { 
  FaHome, 
  FaTable, 
  FaFilter, 
  FaBuilding, 
  FaTrash
} from 'react-icons/fa';
import FilterGroup from './filters/FilterGroup';

const Sidebar = ({ 
  isOpen, 
  activeView, 
  setActiveView, 
  filterOptions, 
  filters, 
  onFilterChange, 
  clearFilters,
  toggleSidebar
}) => {
  return (
    <>
      {/* Sidebar overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-accent-900 bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      
      <div 
        className={`fixed top-16 bottom-0 left-0 z-30 bg-white shadow-lg border-r border-primary-200 overflow-y-auto transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 w-72' : '-translate-x-full w-0'
        } lg:translate-x-0 lg:static lg:h-full ${
          isOpen ? 'lg:w-64 lg:min-w-[16rem]' : 'lg:w-0 lg:min-w-0'
        }`}
      >
        <nav className="px-4 py-4">
          <div className="space-y-1">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md w-full transition-colors duration-200 ${
                activeView === 'dashboard'
                  ? 'bg-primary-500 text-white'
                  : 'text-accent-800 hover:bg-primary-50 hover:text-primary-700'
              }`}
            >
              <FaHome className="mr-3 h-4 w-4 flex-shrink-0" />
              <span className="truncate">Gösterge Paneli</span>
            </button>
            <button
              onClick={() => setActiveView('data')}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md w-full transition-colors duration-200 ${
                activeView === 'data'
                  ? 'bg-primary-500 text-white'
                  : 'text-accent-800 hover:bg-primary-50 hover:text-primary-700'
              }`}
            >
              <FaTable className="mr-3 h-4 w-4 flex-shrink-0" />
              <span className="truncate">Veri Tablosu</span>
            </button>
          </div>
        </nav>

        <div className="px-4 py-5 border-t border-gray-200">
          <h2 className="text-accent-900 text-sm font-semibold mb-4 flex items-center">
            <FaFilter className="mr-2 text-primary-500" />
            Filtreler
          </h2>
          
          <FilterGroup 
            label="MRO Şirketleri" 
            options={filterOptions.mro}
            selectedValues={filters.mro}
            onChange={(values) => onFilterChange('mro', values)}
            showCount={8}
          />
          
          <FilterGroup 
            label="Havayolları" 
            options={filterOptions.airline}
            selectedValues={filters.airline}
            onChange={(values) => onFilterChange('airline', values)}
            showCount={6}
          />
          
          <FilterGroup 
            label="Bakım Tipi" 
            options={filterOptions.serviceType}
            selectedValues={filters.serviceType}
            onChange={(values) => onFilterChange('serviceType', values)}
            showCount={5}
          />
          
          <FilterGroup 
            label="Anlaşma Yılı" 
            options={filterOptions.agreementYear}
            selectedValues={filters.agreementYear}
            onChange={(values) => onFilterChange('agreementYear', values)}
            showCount={3}
          />
          
          <div className="mt-6">
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-md border border-primary-500 text-primary-600 bg-white hover:bg-primary-50 transition-colors"
            >
              <FaTrash className="mr-1.5 h-3 w-3" />
              Filtreleri Temizle
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;