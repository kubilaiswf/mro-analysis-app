import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { mroFirmalari } from '../../data/maintenanceData';

const AgreementTimelineChart = ({ data }) => {
  const chartData = useMemo(() => {
    // Extract years from all agreements of all MRO firms
    const yearCounts = {};
    
    mroFirmalari.forEach(mro => {
      if (mro.anlasmalar && Array.isArray(mro.anlasmalar)) {
        mro.anlasmalar.forEach(anlasma => {
          // Try to extract year from agreement text using regex
          const yearMatch = anlasma.match(/\((\d{4})\)/);
          if (yearMatch && yearMatch[1]) {
            const year = yearMatch[1];
            if (!yearCounts[year]) {
              yearCounts[year] = 0;
            }
            yearCounts[year]++;
          }
        });
      }
    });
    
    // Sort years chronologically
    const sortedYears = Object.keys(yearCounts).sort();
    
    // Fill in missing years with zero counts
    const allYears = [];
    const allCounts = [];
    
    if (sortedYears.length > 0) {
      const startYear = parseInt(sortedYears[0]);
      const endYear = parseInt(sortedYears[sortedYears.length - 1]);
      
      for (let year = startYear; year <= endYear; year++) {
        allYears.push(year.toString());
        allCounts.push(yearCounts[year.toString()] || 0);
      }
    } else {
      // If no agreements with years found, use sample data for demonstration
      allYears.push('2023', '2024', '2025');
      allCounts.push(3, 2, 2); // Sample counts
    }
    
    return {
      labels: allYears,
      datasets: [
        {
          label: 'Anlaşma Sayısı',
          data: allCounts,
          backgroundColor: 'rgba(20, 184, 166, 0.7)',
          borderColor: 'rgb(13, 148, 136)',
          borderWidth: 1,
          borderRadius: 4,
          hoverBackgroundColor: 'rgba(20, 184, 166, 0.9)',
        },
      ],
    };
  }, []); // Direct dependency on mroFirmalari instead of passed data

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
        callbacks: {
          label: function(context) {
            return `${context.raw} anlaşma`;
          }
        }
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

  return <Bar data={chartData} options={options} />;
};

export default AgreementTimelineChart;