import React, { useRef, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// amCharts imports
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
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

    // Interface renklerini sıfırla
    root.interfaceColors.set("grid", am5.color(0xffffff));
    root.interfaceColors.set("text", am5.color(0xffffff));
    root.interfaceColors.set("background", am5.color(0x1f2937));
    root.interfaceColors.set("fill", am5.color(0xdc2626)); // Varsayılan fill rengini kırmızı yap
    root.interfaceColors.set("primaryButton", am5.color(0xdc2626));
    root.interfaceColors.set("primaryButtonHover", am5.color(0xef4444));

    let chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        panY: "rotateY",
        projection: am5map.geoOrthographic(),
        paddingBottom: 20, 
        paddingTop: 20, 
        paddingLeft: 20, 
        paddingRight: 20,
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

    // Ana kıta serisi
    let continentSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_continentsLow,
        valueField: "value",
        exclude: ["AQ"]
      })
    );

    continentSeries.mapPolygons.template.setAll({
      interactive: true,
      strokeWidth: 1.5,
      strokeOpacity: 0.7,
      stroke: am5.color(0xffffff),
      fillOpacity: 0.75,
      fill: am5.color(0xdc2626) // Varsayılan olarak kırmızı ata
    });

    // Grimsi renkler ile kıta verilerini ayarla
    continentSeries.data.setAll([
      { id: "AF", value: 1, name: "Africa" },
      { id: "AS", value: 2, name: "Asia" },
      { id: "EU", value: 3, name: "Europe" },
      { id: "NA", value: 4, name: "North America" },
      { id: "SA", value: 5, name: "South America" },
      { id: "OC", value: 6, name: "Oceania" }
    ]);

    // Renk haritası - kırmızımsı tonlar
    const colorMap = {
      "AF": "#dc2626", // Africa - kırmızı
      "AS": "#991b1b", // Asia - koyu kırmızı  
      "EU": "#b91c1c", // Europe - orta kırmızı
      "NA": "#7f1d1d", // North America - çok koyu kırmızı
      "SA": "#ef4444", // South America - açık kırmızı
      "OC": "#f87171"  // Oceania - pembe kırmızı
    };

    // Her polygon için rengi manuel olarak ayarla
    continentSeries.events.on("datavalidated", function() {
      continentSeries.mapPolygons.each(function(polygon) {
        if (polygon.dataItem && polygon.dataItem.dataContext) {
          const continentId = polygon.dataItem.dataContext.id;
          const color = colorMap[continentId];
          if (color) {
            polygon.set("fill", am5.color(color));
          }
        }
      });
    });

    continentSeries.mapPolygons.template.states.create("hover", {
      fillOpacity: 0.9,
      strokeWidth: 2,
      strokeOpacity: 1,
    });

    // Hover olaylarını ekle - diğer kıtaları saydamlaştır
    continentSeries.mapPolygons.template.events.on("pointerover", function(ev) {
      let hoveredPolygon = ev.target;
      continentSeries.mapPolygons.each(function(polygon) {
        if (polygon !== hoveredPolygon) {
          polygon.animate({ key: "fillOpacity", to: 0.3, duration: 200 });
          polygon.animate({ key: "strokeOpacity", to: 0.3, duration: 200 });
        }
      });
    });

    // Hover çıktığında opacity'leri normale döndür
    continentSeries.mapPolygons.template.events.on("pointerout", function(ev) {
      continentSeries.mapPolygons.each(function(polygon) {
        polygon.animate({ key: "fillOpacity", to: 0.75, duration: 200 });
        polygon.animate({ key: "strokeOpacity", to: 0.7, duration: 200 });
      });
    });
    
    continentSeries.mapPolygons.template.events.on("click", function(ev) {
      let dataItem = ev.target.dataItem;
      if (dataItem && dataItem.dataContext && dataItem.dataContext.name) {
        console.log(`Polygon Click: ${dataItem.dataContext.name}`); 
        handleContinentClick(dataItem.dataContext.name);
      }
    });

    // Arkaplan fill serisi
    let backgroundSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
    backgroundSeries.mapPolygons.template.setAll({
      fill: root.interfaceColors.get("alternativeBackground"),
      fillOpacity: 0.05,
      strokeOpacity: 0
    });
    backgroundSeries.data.push({
      geometry: am5map.getGeoRectangle(90, 180, -90, -180)
    });

    // Graticule (çizgi çizgi efekt) serisi
    let graticuleSeries = chart.series.unshift(
      am5map.GraticuleSeries.new(root, {
        step: 10
      })
    );
    graticuleSeries.mapLines.template.set("strokeOpacity", 0.1);

    // Label serisi
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