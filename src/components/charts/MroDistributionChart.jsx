import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { mroFirmalari } from '../../data/maintenanceData';

const MroDistributionChart = ({ data }) => {
  const chartData = useMemo(() => {
    // In the new structure, we simply count the number of customers for each MRO
    const labels = mroFirmalari.map(mro => mro.mroFirmasiAdi);
    const values = mroFirmalari.map(mro => mro.musteriPortfoyu ? mro.musteriPortfoyu.length : 0);
    
    // Add other metrics as stacked bars
    const serviceValues = mroFirmalari.map(mro => mro.hizmetleri ? mro.hizmetleri.length : 0);
    const certificationValues = mroFirmalari.map(mro => mro.sertifikalar ? mro.sertifikalar.length : 0);
    
    return {
      labels,
      datasets: [
        {
          label: 'Müşteri Sayısı',
          data: values,
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: 'rgb(79, 70, 229)',
          borderWidth: 1,
          borderRadius: 4,
          hoverBackgroundColor: 'rgba(99, 102, 241, 0.9)',
        },
        {
          label: 'Hizmet Sayısı',
          data: serviceValues,
          backgroundColor: 'rgba(20, 184, 166, 0.7)',
          borderColor: 'rgb(13, 148, 136)',
          borderWidth: 1,
          borderRadius: 4,
          hoverBackgroundColor: 'rgba(20, 184, 166, 0.9)',
        },
        {
          label: 'Sertifika Sayısı',
          data: certificationValues,
          backgroundColor: 'rgba(249, 115, 22, 0.7)',
          borderColor: 'rgb(234, 88, 12)',
          borderWidth: 1,
          borderRadius: 4,
          hoverBackgroundColor: 'rgba(249, 115, 22, 0.9)',
        },
      ],
    };
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter',
          },
        },
      },
      tooltip: {
        bodyFont: {
          family: 'Inter',
        },
        titleFont: {
          family: 'Inter',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          drawBorder: false,
        },
        ticks: {
          font: {
            family: 'Inter',
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Inter',
          },
        },
      },
    },
  };

  // Fallback if no data is available
  if (mroFirmalari.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">MRO firma verisi bulunamadı</p>
      </div>
    );
  }

  return <Bar data={chartData} options={options} />;
};

export default MroDistributionChart;