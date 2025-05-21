import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { mroFirmalari } from '../../data/maintenanceData';

const AircraftModelChart = ({ data }) => {
  const chartData = useMemo(() => {
    const modelMap = {};
    
    // Use MRO firms data to extract aircraft models
    mroFirmalari.forEach(mro => {
      // Get all aircraft models from each MRO
      if (mro.bakimHizmetiVerilenUcakTipleri) {
        // Iterate through each aircraft manufacturer
        Object.entries(mro.bakimHizmetiVerilenUcakTipleri).forEach(([manufacturer, models]) => {
          // Process each model for this manufacturer
          models.forEach(model => {
            // Simplify model names to make chart more readable
            let simplifiedModel = model;
            
            // Extract model numbers for common manufacturers
            if (model.includes('A320') || model.includes('A330') || model.includes('A340')) {
              const type = model.match(/A3\d\d/);
              if (type) {
                simplifiedModel = `Airbus ${type[0]}`;
              } else {
                simplifiedModel = 'Airbus A3xx';
              }
            } else if (model.includes('B737') || model.includes('B747') || model.includes('B757') || model.includes('B767') || model.includes('B777')) {
              const type = model.match(/B7\d\d/);
              if (type) {
                simplifiedModel = `Boeing ${type[0]}`;
              } else {
                simplifiedModel = 'Boeing 7xx';
              }
            } else if (model.includes('Embraer')) {
              simplifiedModel = 'Embraer Jets';
            } else if (model.includes('CRJ')) {
              simplifiedModel = 'Bombardier CRJ';
            }
            
            // Skip if the model is just a number
            if (/^\d+$/.test(model)) {
              return;
            }
            
            // Count the model
            if (!modelMap[simplifiedModel]) {
              modelMap[simplifiedModel] = 0;
            }
            modelMap[simplifiedModel]++;
          });
        });
      }
    });
    
    // Sort models by count (descending)
    const sortedModels = Object.entries(modelMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Top 10 models only for readability
    
    const labels = sortedModels.map(item => item[0]);
    const values = sortedModels.map(item => item[1]);
    
    // Generate colors
    const colors = [
      'rgba(99, 102, 241, 0.7)',   // Primary
      'rgba(249, 115, 22, 0.7)',    // Accent
      'rgba(20, 184, 166, 0.7)',    // Secondary
      'rgba(139, 92, 246, 0.7)',    // Purple
      'rgba(236, 72, 153, 0.7)',    // Pink
      'rgba(14, 165, 233, 0.7)',    // Sky Blue
      'rgba(34, 197, 94, 0.7)',     // Green
      'rgba(234, 179, 8, 0.7)',     // Yellow
      'rgba(239, 68, 68, 0.7)',     // Red
      'rgba(75, 85, 99, 0.7)',      // Gray
    ];
    
    return {
      labels,
      datasets: [
        {
          label: 'Uçak Modelleri',
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(c => c.replace('0.7', '1')),
          borderWidth: 1,
        },
      ],
    };
  }, []);  // Note we're not dependent on the data prop anymore but on mroFirmalari directly

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            family: 'Inter',
          },
          padding: 15,
        },
      },
      tooltip: {
        bodyFont: {
          family: 'Inter',
        },
        titleFont: {
          family: 'Inter',
        },
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw} MRO firması destekliyor`;
          }
        }
      },
    },
  };

  // Fallback if no data is available
  if (mroFirmalari.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Uçak modeli verisi bulunamadı</p>
      </div>
    );
  }

  return <Pie data={chartData} options={options} />;
};

export default AircraftModelChart;