import React, { useRef, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// amCharts imports
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow';
import am5geodata_continentsLow from '@amcharts/amcharts5-geodata/continentsLow';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

const ContinentMap = () => {
  const chartRef = useRef(null);
  const navigate = useNavigate();

  const handleContinentClick = (continentName) => {
    console.log("ContinentMap - Kıtaya tıklandı, yönlendiriliyor:", continentName);
    navigate(`/continent/${continentName}`);
  };

  useLayoutEffect(() => {
    let root = am5.Root.new("continentmapdiv");
    root.setThemes([am5themes_Animated.new(root)]);

    root.interfaceColors.set("grid", am5.color("#ffffff"));
    root.interfaceColors.set("text", am5.color("#ffffff"));

    let chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "translateX",
        panY: "translateY",
        projection: am5map.geoMercator(),
        paddingBottom: 20,
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20
      })
    );

    let continentSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_continentsLow,
        valueField: "value"
      })
    );

    continentSeries.data.setAll([
      { id: "AF", value: 1, name: "Africa" },
      { id: "AS", value: 2, name: "Asia" },
      { id: "EU", value: 3, name: "Europe" },
      { id: "NA", value: 4, name: "North America" },
      { id: "SA", value: 5, name: "South America" },
      { id: "OC", value: 6, name: "Oceania" }
    ]);

    continentSeries.events.once("datavalidated", function() {
      console.log("ContinentMap - Tüm poligonlar:", continentSeries.dataItems.map(di => di.dataContext));
    });

    let continentColors = {
      1: am5.color("#fbbf24"),
      2: am5.color("#34d399"),
      3: am5.color("#818cf8"),
      4: am5.color("#f87171"),
      5: am5.color("#a78bfa"),
      6: am5.color("#60a5fa")
    };

    continentSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
      fill: am5.color("#374151"),
      strokeWidth: 1,
      strokeOpacity: 0.8,
      stroke: am5.color("#4B5563")
    });

    continentSeries.mapPolygons.template.adapters.add("fill", function(fill, target) {
      let dataItem = target.dataItem;
      if (dataItem && dataItem.dataContext) {
        let value = dataItem.dataContext.value;
        return continentColors[value] || fill;
      }
      return fill;
    });

    continentSeries.mapPolygons.template.states.create("hover", {
      fillOpacity: 0.7,
      strokeWidth: 2,
      stroke: am5.color("#ffffff")
    });

    continentSeries.mapPolygons.template.events.on("click", function(ev) {
      let dataItem = ev.target.dataItem;
      if (dataItem && dataItem.dataContext && dataItem.dataContext.name) {
        handleContinentClick(dataItem.dataContext.name);
      } else {
        console.log("[POLYGON] Tıklanan: data yok", ev);
      }
    });

    let labelSeries = chart.series.push(
      am5map.MapPointSeries.new(root, {})
    );

    labelSeries.bullets.push(function(root, series, dataItem) {
      const label = am5.Label.new(root, {
        text: "{name}",
        fill: am5.color("#FFFFFF"),
        populateText: true,
        centerX: am5.p50,
        centerY: am5.p50,
        textAlign: "center",
        fontSize: 16,
        fontWeight: "700",
        shadowColor: am5.color("#000000"),
        shadowBlur: 4,
        shadowOffsetX: 1,
        shadowOffsetY: 1
      });

      label.events.on("click", function(ev) {
        const context = dataItem.dataContext;
        if (context && context.name) {
          handleContinentClick(context.name);
        }
      });

      return am5.Bullet.new(root, { sprite: label });
    });

    labelSeries.data.setAll([
      { geometry: { type: "Point", coordinates: [20, 10] }, name: "Africa" },
      { geometry: { type: "Point", coordinates: [95, 35] }, name: "Asia" },
      { geometry: { type: "Point", coordinates: [15, 50] }, name: "Europe" },
      { geometry: { type: "Point", coordinates: [-100, 40] }, name: "North America" },
      { geometry: { type: "Point", coordinates: [-60, -20] }, name: "South America" },
      { geometry: { type: "Point", coordinates: [140, -25] }, name: "Oceania" }
    ]);

    labelSeries.events.once("datavalidated", function() {
      console.log("ContinentMap - Tüm label'lar:", labelSeries.dataItems.map(di => di.dataContext));
    });

    chart.children.unshift(
      am5.Rectangle.new(root, {
        fill: am5.color("#1f2937"),
        x: am5.p0,
        y: am5.p0,
        width: am5.p100,
        height: am5.p100,
        layer: 0
      })
    );

    chart.appear(1000, 100);
    chart.set("zoomControl", am5map.ZoomControl.new(root, {}));

    return () => {
      root.dispose();
    };
  }, []);

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
        Kıtalara Göre MRO Dağılımı ve Bilgileri (Detay için tıklayın)
      </h3>
      <div id="continentmapdiv" style={{ width: "100%", height: "490px" }}></div>
    </div>
  );
};

export default ContinentMap; 