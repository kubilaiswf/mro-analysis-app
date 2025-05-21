import React, { useMemo } from 'react';
import { formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { FaPlane, FaTools, FaCalendarAlt, FaBuilding, FaWrench } from 'react-icons/fa';
import { mroFirmalari } from '../data/maintenanceData';

const DashboardSummary = ({ data }) => {
  // Tüm havayollarının toplam sayısını hesapla
  const totalUniqueAirlines = useMemo(() => {
    const airlinesSet = new Set();
    
    // Tüm MRO firmalarının müşteri portföyünden havayollarını topla
    mroFirmalari.forEach(mro => {
      if (mro.musteriPortfoyu && Array.isArray(mro.musteriPortfoyu)) {
        mro.musteriPortfoyu.forEach(musteri => {
          airlinesSet.add(musteri.havayolu);
        });
      }
    });
    
    return airlinesSet.size;
  }, []);

  // Tüm anlaşmaların toplam sayısını hesapla
  const totalAgreements = useMemo(() => {
    let total = 0;
    
    // Tüm MRO firmalarının anlaşmalarını topla
    mroFirmalari.forEach(mro => {
      if (mro.anlasmalar && Array.isArray(mro.anlasmalar)) {
        total += mro.anlasmalar.length;
      }
    });
    
    return total;
  }, []);

  // Güncel ve gelecek anlaşmaların sayısını hesapla
  const agreementCounts = useMemo(() => {
    const currentYear = new Date().getFullYear();
    let recent = 0;
    let upcoming = 0;
    
    mroFirmalari.forEach(mro => {
      if (mro.anlasmalar && Array.isArray(mro.anlasmalar)) {
        mro.anlasmalar.forEach(anlasma => {
          // Anlaşma detayından yıl bilgisini çıkar (2023), (2024), (2025) gibi
          const yearMatch = anlasma.match(/\((\d{4})\)/);
          if (yearMatch) {
            const year = parseInt(yearMatch[1]);
            if (year === currentYear || year === currentYear - 1) {
              recent++;
            } else if (year > currentYear) {
              upcoming++;
            }
          }
        });
      }
    });
    
    return { recent, upcoming };
  }, []);

  const summary = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalMROs: 0,
        totalAirlines: 0,
        totalServices: 0,
        recentAgreements: 0,
        upcomingAgreements: 0,
      };
    }

    const uniqueMROs = new Set(data.map(item => item.mro_company)).size;
    const uniqueAirlines = new Set(data.map(item => item.airline)).size;
    
    const allServices = data
      .map(item => item.service_type.split(','))
      .flat()
      .map(s => s.trim())
      .filter(s => s !== 'n/a');
    
    const uniqueServices = new Set(allServices).size;
    
    // Get recent and upcoming agreements
    const currentYear = new Date().getFullYear();
    
    const recent = data.filter(item => {
      if (item.agreement_date === 'n/a') return false;
      const year = parseInt(item.agreement_date.substring(0, 4));
      return year === currentYear || year === currentYear - 1;
    }).length;
    
    const upcoming = data.filter(item => {
      if (item.agreement_date === 'n/a') return false;
      const year = parseInt(item.agreement_date.substring(0, 4));
      return year > currentYear;
    }).length;
    
    return {
      totalMROs: uniqueMROs,
      totalAirlines: uniqueAirlines,
      totalServices: uniqueServices,
      recentAgreements: recent,
      upcomingAgreements: upcoming,
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
      <div className="card bg-primary-500 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Operatörler</h3>
            <div className="text-3xl font-bold">{totalUniqueAirlines}</div>
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <FaPlane className="h-6 w-6" />
          </div>
        </div>
      </div>
      
      <div className="card bg-accent-900 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">MRO Şirketleri</h3>
            <div className="text-3xl font-bold">{summary.totalMROs}</div>
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <FaWrench className="h-6 w-6" />
          </div>
        </div>
      </div>
      
    </div>

  );
};

export default DashboardSummary;