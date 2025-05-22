import React, { useRef, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// amCharts imports
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
// import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow'; // Kullanılmıyor
import am5geodata_continentsLow from '@amcharts/amcharts5-geodata/continentsLow';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

const ContinentMap = () => {
  const chartRef = useRef(null);
  const navigate = useNavigate();
  const [selectedContinent, setSelectedContinent] = useState(null);
  
  // Kıta ID'sini isimden alma yardımcı fonksiyonu
  const getContinentId = (continentName) => {
    const idMap = {
      "Africa": "AF", "Asia": "AS", "Europe": "EU",
      "North America": "NA", "South America": "SA", "Oceania": "OC"
    };
    return idMap[continentName] || "";
  };

  // Kıta merkez koordinatlarını alma - Bu koordinatlar geoOrthographic projeksiyon için uyarlanmıştır
  const getContinentCenter = (continentName) => {
    const centerMap = {
      "Africa": { longitude: 20, latitude: 5 }, 
      "Asia": { longitude: 95, latitude: 35 },
      "Europe": { longitude: 15, latitude: 52 }, 
      "North America": { longitude: -100, latitude: 45 },
      "South America": { longitude: -60, latitude: -20 }, 
      "Oceania": { longitude: 140, latitude: -25 }
    };
    return centerMap[continentName] || { longitude: 0, latitude: 0 };
  };

  // Kıta zoom seviyelerini alma
  const getContinentZoom = (continentName) => {
    const zoomMap = {
      "Africa": 2.8, "Asia": 2.5, "Europe": 4.5,
      "North America": 2.5, "South America": 3.3, "Oceania": 3.3
    };
    return zoomMap[continentName] || 1.5;
  };

  const handleContinentClick = (continentName) => {
    // Her zaman sabit tanımladığımız merkez noktalarını kullanıyoruz
    const centerToUse = getContinentCenter(continentName);
    
    console.log(`ContinentMap - Clicked: ${continentName}, Using Fixed Center:`, centerToUse);

    if (chartRef.current && chartRef.current.map && chartRef.current.series && chartRef.current.root) {
      const continentData = {
        name: continentName,
        id: getContinentId(continentName),
        center: centerToUse,
        zoom: getContinentZoom(continentName)
      };
      setSelectedContinent(continentData);
      
      zoomToContinent(continentData);
    } else {
      console.warn("Chart references not fully available for handleContinentClick, navigating directly for", continentName);
      navigate(`/continent/${continentName}`);
    }
  };

  const zoomToContinent = (continent) => {
    if (!chartRef.current || !chartRef.current.map || !chartRef.current.series) {
      console.error("Chart references not available for zoom. Navigating directly for", continent.name);
      navigate(`/continent/${continent.name}`);
      return;
    }

    const chart = chartRef.current.map;
    const continentSeries = chartRef.current.series;
    const animationDuration = chart.get("animationDuration", 800); // Genel animasyon süresini al

    // Seçilen kıtanın polygon referansını bul (diğer kıtaları saydamlaştırmak için)
    let selectedPolygon = null;
    continentSeries.mapPolygons.each(function(polygon) {
      if (polygon.dataItem.dataContext.id === continent.id) {
        selectedPolygon = polygon;
      }
    });

    if (!selectedPolygon || !selectedPolygon.dataItem) { 
      console.error("Selected polygon or its dataItem not found for continent:", continent.name);
      navigate(`/continent/${continent.name}`);
      return;
    }

    // Diğer kıtaları saydamlaştır
    continentSeries.mapPolygons.each(function(polygon) {
      if (polygon.filters) {
        polygon.filters.clear();
      }
      if (polygon.dataItem.dataContext.id !== continent.id) {
        polygon.animate({ key: "fillOpacity", to: 0.3, duration: 400 });
        polygon.animate({ key: "strokeOpacity", to: 0.2, duration: 400 });
      } else {
        polygon.animate({ key: "fillOpacity", to: 0.85, duration: 400 });
        polygon.animate({ key: "strokeOpacity", to: 1, duration: 400 });
      }
    });

    // 1. Haritayı seçilen kıtanın merkezine döndür
    console.log(`Rotating to: Longitude ${-continent.center.longitude}, Latitude ${continent.center.latitude} for ${continent.name}`);
    
    chart.animate({
      key: "rotationX",
      to: -continent.center.longitude,
      duration: animationDuration,
      easing: am5.ease.out(am5.ease.cubic)
    });

    chart.animate({
      key: "rotationY",
      to: -continent.center.latitude,
      duration: animationDuration,
      easing: am5.ease.out(am5.ease.cubic)
    });
    
    // 2. Dönme animasyonu bittikten sonra yakınlaştır
    setTimeout(() => {
      console.log(`Zooming to level: ${continent.zoom} for ${continent.name}`);
      chart.animate({
        key: "zoomLevel",
        to: continent.zoom,
        duration: animationDuration / 2, // Yakınlaşma animasyonu biraz daha hızlı olabilir
        easing: am5.ease.out(am5.ease.cubic)
      });

      // Yakınlaşma animasyonu da bittikten sonra yönlendir
      setTimeout(() => {
        navigate(`/continent/${continent.name}`);
      }, (animationDuration / 2) + 200);

    }, animationDuration); // Dönme animasyon süresi kadar bekle
  };

  useLayoutEffect(() => {
    let root = am5.Root.new("continentmapdiv");
    root.setThemes([am5themes_Animated.new(root)]);

    root.interfaceColors.set("grid", am5.color(0xffffff));
    root.interfaceColors.set("text", am5.color(0xffffff));
    root.interfaceColors.set("background", am5.color(0x1f2937));

    let chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        panY: "rotateY",
        projection: am5map.geoOrthographic(),
        paddingBottom: 10, paddingTop: 10, paddingLeft: 10, paddingRight: 10,
        homeZoomLevel: 1,
        homeGeoPoint: { longitude: 0, latitude: 20 }, // Başlangıç merkezi
        maxZoomLevel: 7,
        minZoomLevel: 1,
        rotationX: 0, 
        rotationY: 0,  
        animationDuration: 1200, // Genel animasyon süresi (ms) - biraz artırıldı
        wheelRotateAnimationDuration: 600, // Tekerlek ile döndürme animasyon süresi
        panAnimationDuration: 600 // Pan animasyon süresi
      })
    );
    
    chart.chartContainer.set("background", am5.Rectangle.new(root, {
        fill: am5.color(0x1f2937),
        fillOpacity: 1
    }));

    let continentSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_continentsLow,
        valueField: "value",
        exclude: ["AQ"]
      })
    );

    continentSeries.data.setAll([
      { id: "AF", value: 1, name: "Africa", polygonSettings: { fill: am5.color("#fbbf24")} },
      { id: "AS", value: 2, name: "Asia", polygonSettings: { fill: am5.color("#34d399")} },
      { id: "EU", value: 3, name: "Europe", polygonSettings: { fill: am5.color("#818cf8")} },
      { id: "NA", value: 4, name: "North America", polygonSettings: { fill: am5.color("#f87171")} },
      { id: "SA", value: 5, name: "South America", polygonSettings: { fill: am5.color("#a78bfa")} },
      { id: "OC", value: 6, name: "Oceania", polygonSettings: { fill: am5.color("#60a5fa")} }
    ]);

    continentSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
      templateField: "polygonSettings",
      strokeWidth: 1.5,
      strokeOpacity: 0.7,
      stroke: am5.color(0xffffff),
      fillOpacity: 0.75
    });

    continentSeries.mapPolygons.template.states.create("hover", {
      fillOpacity: 0.9,
      strokeWidth: 2,
      strokeOpacity: 1,
    });
    
    continentSeries.mapPolygons.template.events.on("click", function(ev) {
      let dataItem = ev.target.dataItem;
      if (dataItem && dataItem.dataContext && dataItem.dataContext.name) {
        // DÜZELTME 3: Dynamic centroid kullanımını kaldırıp sabit tanımladığımız merkez noktalarına güveniyoruz
        console.log(`Polygon Click: ${dataItem.dataContext.name}`); 
        handleContinentClick(dataItem.dataContext.name);
      }
    });

    let labelSeries = chart.series.push(
      am5map.MapPointSeries.new(root, {
        longitudeField: "longitude",
        latitudeField: "latitude"
      })
    );

    labelSeries.bullets.push(function(root, series, dataItem) {
      const label = am5.Label.new(root, {
        text: "{name}",
        fill: am5.color("#FFFFFF"),
        populateText: true,
        centerX: am5.p50,
        centerY: am5.p50,
        textAlign: "center",
        fontSize: "1.1em",
        fontWeight: "600",
        paddingTop: 3, paddingBottom: 3, paddingLeft: 6, paddingRight: 6,
        shadowColor: am5.color("#000000"), shadowBlur: 3, shadowOffsetX: 1, shadowOffsetY: 1,
        interactive: true,
        cursorOverStyle: "pointer",
        background: am5.RoundedRectangle.new(root, {
          fill: am5.color(0x000000), fillOpacity: 0.5, strokeOpacity: 0
        })
      });

      label.events.on("click", function(ev) {
        const labelDataContext = dataItem.dataContext;
        if (labelDataContext && labelDataContext.name) {
          // DÜZELTME 4: Etiket tıklamalarında da geoCentroid hesaplamayı kaldırdık
          console.log(`Label Click for ${labelDataContext.name}`);
          handleContinentClick(labelDataContext.name);
        }
      });
      return am5.Bullet.new(root, {
        sprite: label,
        dynamic: true
      });
    });
    
    // Kıta etiketlerinin konumları - küre görünümü için uyarlandı
    let labelPositions = {
      "AF": { longitude: 20, latitude: 0 }, 
      "AS": { longitude: 90, latitude: 25 },
      "EU": { longitude: 15, latitude: 55 }, 
      "NA": { longitude: -100, latitude: 45 },
      "SA": { longitude: -60, latitude: -25 }, 
      "OC": { longitude: 140, latitude: -20 }
    };
    
    labelSeries.data.setAll([
      { id: "AF", name: "Africa", longitude: labelPositions.AF.longitude, latitude: labelPositions.AF.latitude },
      { id: "AS", name: "Asia", longitude: labelPositions.AS.longitude, latitude: labelPositions.AS.latitude },
      { id: "EU", name: "Europe", longitude: labelPositions.EU.longitude, latitude: labelPositions.EU.latitude },
      { id: "NA", name: "North America", longitude: labelPositions.NA.longitude, latitude: labelPositions.NA.latitude },
      { id: "SA", name: "South America", longitude: labelPositions.SA.longitude, latitude: labelPositions.SA.latitude },
      { id: "OC", name: "Oceania", longitude: labelPositions.OC.longitude, latitude: labelPositions.OC.latitude }
    ]);
    
    chart.set("zoomControl", am5map.ZoomControl.new(root, {}));
    if (chart.zoomControl && chart.zoomControl.homeButton) {
      chart.zoomControl.homeButton.set("visible", true);
    }
    
    chart.setAll({ wheelSensitivity: 0.6, maxPanOut: 0.1 });
    chart.appear(1000, 100);

    chartRef.current = {
      root: root, map: chart, series: continentSeries, labelSeries: labelSeries
    };

    return () => {
      if (chartRef.current && chartRef.current.root) {
        chartRef.current.root.dispose();
      }
      chartRef.current = null;
    };
  }, [navigate]);

  // renderPazarBuyuklugu, renderBolgeselLiderler, renderYatirimGerekceleri fonksiyonları aynı kalır.
  const renderPazarBuyuklugu = (data) => {
    if (!data) return null;
    return (
        <div className="mb-4">
            <h4 className="text-md font-semibold text-blue-300 mb-2">{data.baslik}</h4>
            {data.veriler && Array.isArray(data.veriler) && (
                <ul className="list-disc list-inside text-sm text-gray-300 pl-2">
                    {data.veriler.map((item, idx) => (
                        <li key={idx} className="mb-1">
                            {item.yil || item.donem}: {item.pazar_buyuklugu_usd || item.pazar_buyuklugu_milyar_abd_dolari || 'N/A'}
                            {(item.buyume_orani || item.oran || item.buyume_orani_cagr) && ` (Büyüme: ${item.buyume_orani || item.oran || item.buyume_orani_cagr})`}
                            {item.aciklama && <span className="text-xs text-gray-400 italic ml-2">({item.aciklama})</span>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
  };

  const renderBolgeselLiderler = (data) => {
    if (!data) return null;
    const ulkelerSource = data.ulkeler || (data.bolgesel_dinamikler_ve_ulke_bazli_mro_analizi && data.bolgesel_dinamikler_ve_ulke_bazli_mro_analizi.ulkeler);
    
    return (
        <div className="mb-4">
            <h4 className="text-md font-semibold text-blue-300 mb-2">{data.baslik || (data.bolgesel_dinamikler_ve_ulke_bazli_mro_analizi && data.bolgesel_dinamikler_ve_ulke_bazli_mro_analizi.baslik)}</h4>
            {data.aciklama_giris && <p className="text-sm text-gray-300 mb-2">{data.aciklama_giris}</p>}
            {ulkelerSource && Array.isArray(ulkelerSource) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ulkelerSource.map((ulkeItem, idx) => (
                        <div key={idx} className="bg-gray-600 p-3 rounded-md">
                            <h5 className="font-medium text-sm text-white mb-1">{ulkeItem.ulke || ulkeItem.ulke_adi}</h5>
                            <p className="text-xs text-gray-300">{ulkeItem.aciklama || ulkeItem.mro_firma_sayisi || ulkeItem.pazar_buyuklugu || ''}</p>
                            {ulkeItem.filo_buyuklugu && <p className="text-xs text-gray-400 mt-1">Filo: {ulkeItem.filo_buyuklugu}</p>}
                            {ulkeItem.tedarik_zinciri && <p className="text-xs text-gray-400 mt-1">Tedarik: {ulkeItem.tedarik_zinciri}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
  };

  const renderYatirimGerekceleri = (data) => {
    if (!data || !data.yatirim_icin_stratejik_gerekceler) return null;
    
    const yatirimData = data.yatirim_icin_stratejik_gerekceler;
    const yeniUcakSiparisleriData = yatirimData.yeni_ucak_siparisleri;
    let siparisListesi;

    if (yeniUcakSiparisleriData) {
        siparisListesi = yeniUcakSiparisleriData.en_fazla_siparis_veren_havayollari_2015_2025 ||
                         yeniUcakSiparisleriData.siparis_listesi ||
                         yeniUcakSiparisleriData.en_fazla_ucak_siparisi_veren_ve_en_buyuk_filolara_sahip_10_havayolu;
    }

    const yaslananFilolarData = yatirimData.yaslanan_ucak_filolari || yatirimData.filo_buyuklugu_ve_yaslanan_ucaklar_artan_bakim_talebi;

    return (
        <div className="mb-4">
            <h3 className="text-lg font-bold text-blue-200 mb-3">{yatirimData.baslik}</h3>
            {yeniUcakSiparisleriData && (
                <div className="mb-3">
                    <h4 className="text-md font-semibold text-blue-300 mb-1">{yeniUcakSiparisleriData.baslik}</h4>
                    <p className="text-sm text-gray-300 mb-2">{yeniUcakSiparisleriData.aciklama || yeniUcakSiparisleriData.giris_aciklamasi}</p>
                    {siparisListesi && Array.isArray(siparisListesi) && (
                        <ul className="list-decimal list-inside text-xs text-gray-300 pl-3">
                            {siparisListesi.slice(0, 5).map((item, idx) => (
                                <li key={idx}>
                                    {item.havayolu || item.havayolu_sirketi}: {item.siparis_sayisi || item.siparis_detaylari || (item.yeni_siparisler ? `${item.yeni_siparisler} (Mevcut: ${item.mevcut_filo || 'N/A'})` : 'N/A')}
                                    {item.agirlikli_modeller && ` (${item.agirlikli_modeller})`}
                                    {item.one_cikan_siparisler_ve_notlar && <span className="text-xxs text-gray-400 block">Not: {item.one_cikan_siparisler_ve_notlar}</span>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            {yaslananFilolarData && (
                <div className="mb-3">
                    <h4 className="text-md font-semibold text-blue-300 mb-1">{yaslananFilolarData.baslik}</h4>
                    {yaslananFilolarData.aciklama && <p className="text-sm text-gray-300 mb-2">{yaslananFilolarData.aciklama}</p> }
                    {yaslananFilolarData.ornekler && Array.isArray(yaslananFilolarData.ornekler) && yaslananFilolarData.ornekler.map((item, idx) => (
                        <p key={idx} className="text-xs text-gray-400 mb-1 pl-3">*{item.sirket}: {item.bilgi}</p>
                    ))}
                    {yaslananFilolarData.yaslanan_filo_etkisi_ve_bakim_ihtiyaclari &&
                        <p className="text-xs text-gray-400 mt-1">{yaslananFilolarData.yaslanan_filo_etkisi_ve_bakim_ihtiyaclari}</p>
                    }
                    {yatirimData.yolcu_trafigi_artiyor && (
                        <div className="mt-2">
                             <h5 className="text-sm font-semibold text-blue-300 mb-1">{yatirimData.yolcu_trafigi_artiyor.baslik}</h5>
                             <p className="text-xs text-gray-300">{yatirimData.yolcu_trafigi_artiyor.aciklama}</p>
                        </div>
                    )}
                    {yatirimData.mro_altyapisi_zayif && (
                        <div className="mt-2">
                             <h5 className="text-sm font-semibold text-blue-300 mb-1">{yatirimData.mro_altyapisi_zayif.baslik}</h5>
                             <p className="text-xs text-gray-300">{yatirimData.mro_altyapisi_zayif.aciklama}</p>
                        </div>
                    )}
                </div>
            )}
            {yatirimData.teknolojik_gelismeler && (
                <div className="mb-3">
                    <h4 className="text-md font-semibold text-blue-300 mb-1">{yatirimData.teknolojik_gelismeler.baslik}</h4>
                    <p className="text-sm text-gray-300">{yatirimData.teknolojik_gelismeler.aciklama}</p>
                </div>
            )}
            {yatirimData.regulasyonlar_ve_guvenlik_standartlari && (
                <div className="mb-3">
                    <h4 className="text-md font-semibold text-blue-300 mb-1">{yatirimData.regulasyonlar_ve_guvenlik_standartlari.baslik}</h4>
                    <p className="text-sm text-gray-300">{yatirimData.regulasyonlar_ve_guvenlik_standartlari.aciklama}</p>
                </div>
            )}
        </div>
    );
  };


  return (
    <div className="h-[550px] rounded-lg shadow-xl overflow-hidden border border-gray-700 bg-gray-800">
      <h3 className="text-xl font-semibold text-white px-4 py-3 border-b border-gray-700 bg-gray-700">
        Kıtalara Göre MRO Dağılımı ve Bilgileri
      </h3>
      <div id="continentmapdiv" style={{ width: "100%", height: "490px" }}></div>
    </div>
  );
};

export default ContinentMap;
