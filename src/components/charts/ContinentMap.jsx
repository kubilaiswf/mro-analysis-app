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
  const [isWorldFixed, setIsWorldFixed] = useState(false);

  // Dünyayı fixleme/fixten çıkarma fonksiyonu
  const toggleWorldFix = () => {
    if (chartRef.current && chartRef.current.map) {
      const chart = chartRef.current.map;
      
      if (isWorldFixed) {
        // Fix'i kaldır - döndürme ve zoom'a izin ver
        chart.set("panX", "rotateX");
        chart.set("panY", "rotateY");
        chart.set("wheelable", true);
        setIsWorldFixed(false);
      } else {
        // Dünyayı ilk sayfa yüklendiği konuma getir (orijinal homeGeoPoint)
        chart.animate({
          key: "rotationX",
          to: 0, // Orijinal X rotasyonu
          duration: 1000,
          easing: am5.ease.out(am5.ease.cubic)
        });
        chart.animate({
          key: "rotationY", 
          to: -20, // Orijinal Y rotasyonu (homeGeoPoint latitude: 20 -> -20)
          duration: 1000,
          easing: am5.ease.out(am5.ease.cubic)
        });
        chart.animate({
          key: "zoomLevel",
          to: 1, // Home zoom level
          duration: 1000,
          easing: am5.ease.out(am5.ease.cubic)
        });
        
        // Sonra kilitle
        setTimeout(() => {
          chart.set("panX", "none");
          chart.set("panY", "none");
          chart.set("wheelable", false);
        }, 1000);
        
        setIsWorldFixed(true);
      }
    }
  };
  
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
    const animationDuration = 2500; // Slowed down animation duration

    // Seçilen kıtanın polygon referansını bul
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

    // Completely disable all mouse interactions to keep world fixed
    chart.set("panX", "none");
    chart.set("panY", "none");
    chart.set("wheelable", false);
    chart.set("pinchZoom", false);

    // Diğer kıtaları saydamlaştır (slower animation)
    continentSeries.mapPolygons.each(function(polygon) {
      if (polygon.filters) {
        polygon.filters.clear();
      }
      if (polygon.dataItem.dataContext.id !== continent.id) {
        polygon.animate({ key: "fillOpacity", to: 0.2, duration: 800 });
        polygon.animate({ key: "strokeOpacity", to: 0.1, duration: 800 });
      } else {
        polygon.animate({ key: "fillOpacity", to: 0.95, duration: 800 });
        polygon.animate({ key: "strokeOpacity", to: 1, duration: 800 });
      }
    });

    // Fixed center coordinates - prevent any drift
    const targetLongitude = -continent.center.longitude;
    const targetLatitude = -continent.center.latitude;
    
    console.log(`Starting slow transition to: ${continent.name}`);
    console.log(`Target rotation: X=${targetLongitude}, Y=${targetLatitude}, Zoom=${continent.zoom}`);

    // 1. Slower rotation animation
    const rotationXAnimation = chart.animate({
      key: "rotationX",
      to: targetLongitude,
      duration: animationDuration * 0.7, // 70% of total duration for rotation
      easing: am5.ease.inOut(am5.ease.cubic)
    });

    const rotationYAnimation = chart.animate({
      key: "rotationY", 
      to: targetLatitude,
      duration: animationDuration * 0.7,
      easing: am5.ease.inOut(am5.ease.cubic)
    });

    // 2. Start zoom later in the animation
    setTimeout(() => {
      console.log(`Starting zoom animation for ${continent.name}`);
      const zoomAnimation = chart.animate({
        key: "zoomLevel",
        to: continent.zoom,
        duration: animationDuration * 0.6, // 60% of total for zoom
        easing: am5.ease.out(am5.ease.quad)
      });

      // 3. Navigate earlier - during animation (not after completion)
      setTimeout(() => {
        console.log(`Navigating to page for ${continent.name}`);
        navigate(`/continent/${continent.name}`);
      }, (animationDuration * 0.3)); // Navigate at 30% of zoom animation (earlier timing)

    }, animationDuration * 0.4); // Start zoom at 40% of total animation

    // 4. Keep interactions disabled permanently to prevent camera movement
    // Don't re-enable mouse controls to maintain fixed center
  };

  useLayoutEffect(() => {
    let root = am5.Root.new("continentmapdiv");
    root.setThemes([am5themes_Animated.new(root)]);

    // Interface renklerini kapalı beyaz/gri tonlar yapıyoruz
    root.interfaceColors.set("grid", am5.color(0xf1f5f9));
    root.interfaceColors.set("text", am5.color(0x374151));
    root.interfaceColors.set("background", am5.color(0xf1f5f9));
    root.interfaceColors.set("fill", am5.color(0xdc2626));
    root.interfaceColors.set("primaryButton", am5.color(0xdc2626));
    root.interfaceColors.set("primaryButtonHover", am5.color(0xef4444));
    root.interfaceColors.set("alternativeBackground", am5.color(0xe2e8f0));

    let chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: isWorldFixed ? "none" : "rotateX",
        panY: isWorldFixed ? "none" : "rotateY",
        projection: am5map.geoOrthographic(),
        paddingBottom: 20, 
        paddingTop: 20, 
        paddingLeft: 20, 
        paddingRight: 20,
        homeZoomLevel: 1,
        homeGeoPoint: { longitude: 0, latitude: 20 },
        maxZoomLevel: 7,
        minZoomLevel: 1,
        rotationX: 0, 
        rotationY: 0,  
        animationDuration: 1300,
        wheelRotateAnimationDuration: 1000,
        panAnimationDuration: 1400,
        // Zoom her zaman merkeze odaklanır
        centerMapOnZoomOut: true,
        wheelSensitivity: 0.8, // Daha hassas wheel
        maxPanOut: 0.1,
        wheelZoomPositionX: 0.5, // Zoom merkeze odaklanır (X ekseni)
        wheelZoomPositionY: 0.5, // Zoom merkeze odaklanır (Y ekseni)
        pinchZoom: false, // Disable pinch zoom
        wheelable: !isWorldFixed // Enable wheel zoom when not fixed
      })
    );
    
    // Chart arkaplan rengini kapalı beyaz yapıyoruz
    chart.chartContainer.set("background", am5.Rectangle.new(root, {
        fill: am5.color(0xf1f5f9),
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
      stroke: am5.color(0xe5e7eb),
      fillOpacity: 0.9,
      fill: am5.color(0xdc2424) // Varsayılan olarak koyu kırmızı ata
    });

    // Kıta verilerini ayarla
    continentSeries.data.setAll([
      { id: "AF", value: 1, name: "Africa" },
      { id: "AS", value: 2, name: "Asia" },
      { id: "EU", value: 3, name: "Europe" },
      { id: "NA", value: 4, name: "North America" },
      { id: "SA", value: 5, name: "South America" },
      { id: "OC", value: 6, name: "Oceania" }
    ]);

    // Daha koyu kırmızı tonlar
    const colorMap = {
      "AF": "#991b1b", // Africa - koyu kırmızı
      "AS": "#7f1d1d", // Asia - çok koyu kırmızı  
      "EU": "#b91c1c", // Europe - koyu kırmızı
      "NA": "#7f1d1d", // North America - çok koyu kırmızı
      "SA": "#991b1b", // South America - koyu kırmızı
      "OC": "#b91c1c"  // Oceania - koyu kırmızı
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
      fillOpacity: 0.95,
      strokeWidth: 1.5,
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
        polygon.animate({ key: "fillOpacity", to: 0.85, duration: 200 });
        polygon.animate({ key: "strokeOpacity", to: 0.8, duration: 200 });
      });
    });
    
    continentSeries.mapPolygons.template.events.on("click", function(ev) {
      let dataItem = ev.target.dataItem;
      if (dataItem && dataItem.dataContext && dataItem.dataContext.name) {
        console.log(`Polygon Click: ${dataItem.dataContext.name}`); 
        handleContinentClick(dataItem.dataContext.name);
      }
    });

    // Arkaplan fill serisi - kapalı beyaz
    let backgroundSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
    backgroundSeries.mapPolygons.template.setAll({
      fill: am5.color(0xe2e8f0), // Kapalı beyaz/gri
      fillOpacity: 0.1,
      strokeOpacity: 0
    });
    backgroundSeries.data.push({
      geometry: am5map.getGeoRectangle(90, 180, -90, -180)
    });

    // Graticule (çizgi çizgi efekt) serisi - siyah çizgiler
    let graticuleSeries = chart.series.unshift(
      am5map.GraticuleSeries.new(root, {
        step: 10
      })
    );
    graticuleSeries.mapLines.template.setAll({
      strokeOpacity: 0.3, // Daha görünür çizgiler
      stroke: am5.color(0x000000), // Siyah çizgi rengi
      strokeWidth: 0.8
    });

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
        fill: am5.color("#1f2937"),
        populateText: true,
        centerX: am5.p50,
        centerY: am5.p50,
        textAlign: "center",
        fontSize: "1.1em",
        fontWeight: "600",
        paddingTop: 3, paddingBottom: 3, paddingLeft: 6, paddingRight: 6,
        shadowColor: am5.color("#ffffff"), shadowBlur: 3, shadowOffsetX: 1, shadowOffsetY: 1,
        interactive: true,
        cursorOverStyle: "pointer",
        background: am5.RoundedRectangle.new(root, {
          fill: am5.color(0xffffff), 
          fillOpacity: 0.95, 
          strokeOpacity: 0.3, 
          stroke: am5.color(0x94a3b8),
          strokeWidth: 1
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
    
    // Zoom kontrollerini devre dışı bırak - özel buton kullanacağız
    // chart.set("zoomControl", am5map.ZoomControl.new(root, {}));
    
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
    <div className="w-full bg-gray-100 rounded-xl shadow-xl overflow-hidden border border-gray-300 relative">
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
        <h3 className="text-xl font-semibold text-white">
          Kıtalara Göre MRO Dağılımı ve Bilgileri
        </h3>
      </div>
      <div className="p-4 bg-gray-100 relative">
        <div id="continentmapdiv" style={{ width: "100%", height: "500px" }}></div>
        

      </div>
    </div>
  );
};

export default ContinentMap;