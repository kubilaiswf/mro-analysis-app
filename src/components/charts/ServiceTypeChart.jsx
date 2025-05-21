import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { mroFirmalari } from '../../data/maintenanceData';

const ServiceTypeChart = ({ data }) => {
  const chartData = useMemo(() => {
    const serviceMap = {};
    
    // Extract service types from all MRO companies
    mroFirmalari.forEach(mro => {
      if (mro.hizmetleri && Array.isArray(mro.hizmetleri)) {
        mro.hizmetleri.forEach(service => {
          // Simplify service types to make chart more readable
          let simplifiedService = service;
          
          if (service.toLowerCase().includes('motor')) {
            simplifiedService = 'Motor Bakım';
          } else if (service.toLowerCase().includes('komponent') || service.toLowerCase().includes('component')) {
            simplifiedService = 'Komponent Desteği';
          } else if (service.toLowerCase().includes('bakım') || service.toLowerCase().includes('maintenance')) {
            simplifiedService = 'Genel Bakım';
          } else if (service.toLowerCase().includes('onarım') || service.toLowerCase().includes('repair')) {
            simplifiedService = 'Onarım Hizmetleri';
          } else if (service.toLowerCase().includes('destek') || service.toLowerCase().includes('support')) {
            simplifiedService = 'Teknik Destek';
          } else if (service.toLowerCase().includes('yedek') || service.toLowerCase().includes('part')) {
            simplifiedService = 'Yedek Parça';
          } else if (service.toLowerCase().includes('mühendislik') || service.toLowerCase().includes('engineering')) {
            simplifiedService = 'Mühendislik Desteği';
          } else if (service.toLowerCase().includes('aviyonik') || service.toLowerCase().includes('avionic')) {
            simplifiedService = 'Aviyonik Sistemler';
          } else if (service.toLowerCase().includes('hidrolik') || service.toLowerCase().includes('hydraulic')) {
            simplifiedService = 'Hidrolik Sistemler';
          } else if (service.toLowerCase().includes('batarya') || service.toLowerCase().includes('battery')) {
            simplifiedService = 'Batarya Servisi';
          } else if (service.toLowerCase().includes('kabin') || service.toLowerCase().includes('cabin')) {
            simplifiedService = 'Kabin Komponentleri';
          } else if (service.toLowerCase().includes('acil') || service.toLowerCase().includes('emergency')) {
            simplifiedService = 'Acil Durum Hizmetleri';
          }
          
          if (!serviceMap[simplifiedService]) {
            serviceMap[simplifiedService] = 0;
          }
          serviceMap[simplifiedService]++;
        });
      }
    });
    
    // Sort by count for better visualization
    const sortedServices = Object.entries(serviceMap)
      .sort((a, b) => b[1] - a[1]);
    
    const labels = sortedServices.map(item => item[0]);
    const values = sortedServices.map(item => item[1]);
    
    // Generate a nice pastel color array
    const colors = [
      'rgba(99, 102, 241, 0.7)',   // Primary
      'rgba(20, 184, 166, 0.7)',    // Secondary
      'rgba(249, 115, 22, 0.7)',    // Accent
      'rgba(139, 92, 246, 0.7)',    // Purple
      'rgba(236, 72, 153, 0.7)',    // Pink
      'rgba(14, 165, 233, 0.7)',    // Sky Blue
      'rgba(34, 197, 94, 0.7)',     // Green
      'rgba(234, 179, 8, 0.7)',     // Yellow
      'rgba(239, 68, 68, 0.7)',     // Red
    ];
    
    return {
      labels,
      datasets: [
        {
          label: 'Bakım Tipleri',
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(c => c.replace('0.7', '1')),
          borderWidth: 1,
        },
      ],
    };
  }, []); // Direct dependency on mroFirmalari instead of passed data

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
            return `${context.label}: ${context.raw} MRO firması sunuyor`;
          }
        }
      },
    },
  };

  // Fallback if no data is available
  if (mroFirmalari.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Hizmet tipi verisi bulunamadı</p>
      </div>
    );
  }

  return <Pie data={chartData} options={options} />;
};

export default ServiceTypeChart;