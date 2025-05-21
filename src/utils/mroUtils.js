/**
 * Compare MRO companies based on different metrics
 * 
 * @param {Array} mroCompanies - Array of MRO company objects
 * @param {String} metric - Metric to compare by
 * @returns {Object} Comparison results
 */
export const compareMROsByMetric = (mroCompanies, metric) => {
  const result = {};
  
  switch(metric) {
    case 'customerCount':
      mroCompanies.forEach(mro => {
        result[mro.mroFirmasiAdi] = mro.musteriPortfoyu.length;
      });
      break;
    
    case 'aircraftTypes':
      mroCompanies.forEach(mro => {
        const totalTypes = Object.values(mro.bakimHizmetiVerilenUcakTipleri)
          .reduce((acc, models) => acc + models.length, 0);
        result[mro.mroFirmasiAdi] = totalTypes;
      });
      break;
    
    case 'serviceCount':
      mroCompanies.forEach(mro => {
        result[mro.mroFirmasiAdi] = mro.hizmetleri.length;
      });
      break;
    
    case 'certificationCount':
      mroCompanies.forEach(mro => {
        result[mro.mroFirmasiAdi] = mro.sertifikalar.length;
      });
      break;
      
    // Add more comparison metrics as needed
    
    default:
      return {};
  }
  
  return result;
};

/**
 * Get common aircraft types between MRO companies
 * 
 * @param {Array} mroCompanies - Array of MRO company objects
 * @returns {Object} Common aircraft types
 */
export const getCommonAircraftTypes = (mroCompanies) => {
  if (mroCompanies.length <= 1) {
    return {};
  }
  
  const allTypes = {};
  
  // Collect all aircraft types from all MROs
  mroCompanies.forEach(mro => {
    Object.entries(mro.bakimHizmetiVerilenUcakTipleri).forEach(([maker, models]) => {
      models.forEach(model => {
        if (!allTypes[maker]) {
          allTypes[maker] = {};
        }
        
        if (!allTypes[maker][model]) {
          allTypes[maker][model] = [];
        }
        
        allTypes[maker][model].push(mro.mroFirmasiAdi);
      });
    });
  });
  
  // Filter for common types (supported by at least 2 MROs)
  const commonTypes = {};
  
  Object.entries(allTypes).forEach(([maker, models]) => {
    const commonModels = {};
    
    Object.entries(models).forEach(([model, companies]) => {
      if (companies.length >= 2) {
        commonModels[model] = companies;
      }
    });
    
    if (Object.keys(commonModels).length > 0) {
      commonTypes[maker] = commonModels;
    }
  });
  
  return commonTypes;
};

/**
 * Format MRO data for chart visualization
 * 
 * @param {Array} mroCompanies - Array of MRO company objects
 * @param {String} dataType - Type of data to extract
 * @returns {Object} Formatted data for charts
 */
export const formatMRODataForCharts = (mroCompanies, dataType) => {
  const chartData = {
    labels: [],
    datasets: []
  };
  
  switch(dataType) {
    case 'customerCount':
      chartData.labels = mroCompanies.map(mro => mro.mroFirmasiAdi);
      chartData.datasets.push({
        label: 'Müşteri Sayısı',
        data: mroCompanies.map(mro => mro.musteriPortfoyu.length),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      });
      break;
      
    case 'aircraftTypes':
      chartData.labels = mroCompanies.map(mro => mro.mroFirmasiAdi);
      chartData.datasets.push({
        label: 'Desteklenen Uçak Tipleri',
        data: mroCompanies.map(mro => 
          Object.values(mro.bakimHizmetiVerilenUcakTipleri).reduce((acc, models) => acc + models.length, 0)
        ),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      });
      break;
      
    // Add more chart data formats as needed
      
    default:
      return { labels: [], datasets: [] };
  }
  
  return chartData;
};

/**
 * Prepare MRO data for comparison table
 * 
 * @param {Array} mroCompanies - Array of MRO company objects
 * @returns {Object} Comparison table data
 */
export const prepareMROComparisonTable = (mroCompanies) => {
  if (mroCompanies.length === 0) {
    return { headers: [], rows: [] };
  }
  
  const headers = ['Metrik', ...mroCompanies.map(mro => mro.mroFirmasiAdi)];
  
  const rows = [
    ['Müşteri Sayısı', ...mroCompanies.map(mro => mro.musteriPortfoyu.length)],
    ['Hizmet Sayısı', ...mroCompanies.map(mro => mro.hizmetleri.length)],
    ['Sertifika Sayısı', ...mroCompanies.map(mro => mro.sertifikalar.length)],
    ['Tesis Sayısı', ...mroCompanies.map(mro => mro.hangarVeTesisKonumlari.length)],
    ['Desteklenen Uçak Tipleri', ...mroCompanies.map(mro => 
      Object.values(mro.bakimHizmetiVerilenUcakTipleri).reduce((acc, models) => acc + models.length, 0)
    )]
  ];
  
  return { headers, rows };
}; 