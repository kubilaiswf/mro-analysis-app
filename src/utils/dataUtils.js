/**
 * Extract unique values from a dataset for a specific field
 * 
 * @param {Array} data - The dataset to extract values from
 * @param {String} field - The field to extract values from
 * @param {Boolean} splitValues - Whether to split values by comma
 * @param {Function} transformFn - Optional function to transform values
 * @returns {Array} Array of unique values
 */
export const getUniqueValues = (data, field, splitValues = false, transformFn = null) => {
  const valueSet = new Set();
  
  data.forEach(item => {
    if (item[field] && item[field] !== 'n/a') {
      if (splitValues) {
        const values = item[field].split(',').map(v => v.trim());
        values.forEach(value => {
          const transformedValue = transformFn ? transformFn(value) : value;
          valueSet.add(transformedValue);
        });
      } else {
        const value = transformFn ? transformFn(item[field]) : item[field];
        valueSet.add(value);
      }
    }
  });
  
  return [...valueSet].sort();
};

/**
 * Filter data based on selected filter values
 * 
 * @param {Array} data - The dataset to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered data
 */
export const filterData = (data, filters) => {
  // If no filters are applied, return all data
  if (Object.values(filters).every(filter => filter.length === 0)) {
    return data;
  }
  
  return data.filter(item => {
    // Check MRO filter
    if (filters.mro.length > 0 && !filters.mro.includes(item.mro_company)) {
      return false;
    }
    
    // Check airline filter
    if (filters.airline.length > 0 && !filters.airline.includes(item.airline)) {
      return false;
    }
    
    // Check service type filter (needs to handle comma-separated values)
    if (filters.serviceType.length > 0) {
      const itemServices = item.service_type.split(',').map(s => s.trim());
      const hasMatchingService = filters.serviceType.some(filter => 
        itemServices.some(service => service.includes(filter))
      );
      
      if (!hasMatchingService) {
        return false;
      }
    }
    
    // Check agreement year filter
    if (filters.agreementYear.length > 0) {
      if (item.agreement_date === 'n/a') {
        return false;
      }
      
      const itemYear = item.agreement_date.substring(0, 4);
      if (!filters.agreementYear.includes(itemYear)) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Get summary statistics from data
 * 
 * @param {Array} data - The dataset to analyze
 * @returns {Object} Summary statistics
 */
export const getSummaryStats = (data) => {
  const summary = {
    totalRecords: data.length,
    uniqueMROs: new Set(data.map(item => item.mro_company)).size,
    uniqueAirlines: new Set(data.map(item => item.airline)).size,
    totalAircraft: 0,
    hasAircraftCount: 0,
  };
  
  data.forEach(item => {
    if (item.aircraft_count !== 'n/a') {
      summary.hasAircraftCount++;
      summary.totalAircraft += parseInt(item.aircraft_count);
    }
  });
  
  return summary;
};

/**
 * Group data by a specific field
 * 
 * @param {Array} data - The dataset to group
 * @param {String} field - The field to group by
 * @returns {Object} Grouped data
 */
export const groupDataByField = (data, field) => {
  return data.reduce((groups, item) => {
    const key = item[field];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};