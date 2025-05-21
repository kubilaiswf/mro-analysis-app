import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaCheck } from 'react-icons/fa';

const FilterGroup = ({ label, options, selectedValues, onChange, showCount = 5 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleOption = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(item => item !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="filter-group mb-4 animate-fade-in">
      <button
        className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-left text-accent-800 rounded-md hover:bg-primary-50 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center min-w-0">
          <span className="truncate">{label}</span>
          {selectedValues.length > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 flex-shrink-0">
              {selectedValues.length}
            </span>
          )}
        </div>
        <span className="ml-2 h-5 flex-shrink-0 flex items-center">
          {isOpen ? <FaChevronUp className="text-primary-500" aria-hidden="true" /> : <FaChevronDown className="text-primary-500" aria-hidden="true" />}
        </span>
      </button>

      {isOpen && (
        <div className="mt-2 animate-slide-in">
          <div className="relative rounded-md shadow-sm mb-2">
            <input
              type="text"
              placeholder="Arama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-3 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div className="mt-1 max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              <div className="space-y-1">
                {filteredOptions.map((option) => (
                  <div
                    key={option}
                    className="relative flex items-center px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleOption(option)}
                  >
                    <div className={`flex-shrink-0 h-4 w-4 border rounded mr-2 flex items-center justify-center ${
                      selectedValues.includes(option) 
                        ? 'bg-primary-600 border-transparent' 
                        : 'border-gray-300'
                    }`}>
                      {selectedValues.includes(option) && <FaCheck className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-accent-800 truncate">{option}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-2 px-3 text-sm text-accent-600 italic">"{searchTerm}" ile eşleşen sonuç yok</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterGroup;