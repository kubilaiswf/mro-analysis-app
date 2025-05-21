import React, { useState, useEffect, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker
} from 'react-simple-maps';
import { geoCentroid } from 'd3-geo';
import { feature } from 'topojson-client';
import { continentInfo } from '../../data/continentInfo';
import { MROLocationMarker, MRODetailsPopup } from '../../components/MROLocationMarker';

// Import GeoJSON files as raw strings
import worldDataRaw from '../../data/continents.geojson?raw';
import countryDataRaw from '../../data/countries-50m.geojson?raw';

const PROJECTION_CONFIG = {
  scale: 160,
  center: [0, 0], // Başlangıç merkezi (Dünya)
};

const InteractiveWorldMap = ({ mroDataByCountry, onCountryClick }) => {
  console.log("InteractiveWorldMap: Rendering component");
  console.log("InteractiveWorldMap: mroDataByCountry prop:", mroDataByCountry);

  const [position, setPosition] = useState({ coordinates: PROJECTION_CONFIG.center, zoom: 1 });
  const [hoveredGeo, setHoveredGeo] = useState(null);
  const [clickedGeo, setClickedGeo] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [countryGeographies, setCountryGeographies] = useState([]);
  const [worldGeographies, setWorldGeographies] = useState(null);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedContinent, setSelectedContinent] = useState(null);
  const [selectedContinentName, setSelectedContinentName] = useState(null);
  const [selectedMRO, setSelectedMRO] = useState(null);
  const [mroLocations, setMroLocations] = useState([]);
  const [countriesByContinent, setCountriesByContinent] = useState({});

  const geographyRef = useRef(null);

  useEffect(() => {
    console.log("InteractiveWorldMap: useEffect triggered");
    try {
      // Parse the raw GeoJSON strings
      const worldData = JSON.parse(worldDataRaw);
      const countryData = JSON.parse(countryDataRaw);

      if (countryData && countryData.objects && countryData.objects.countries) {
        console.log("InteractiveWorldMap: countryData is valid, processing features.");
        const geojson = feature(countryData, countryData.objects.countries);
        setCountryGeographies(geojson.features);
        console.log("InteractiveWorldMap: countryGeographies set:", geojson.features);
        
        // Group countries by continent
        const continentMapping = {};
        geojson.features.forEach(country => {
          if (country.properties.continent) {
            if (!continentMapping[country.properties.continent]) {
              continentMapping[country.properties.continent] = [];
            }
            continentMapping[country.properties.continent].push(country);
          }
        });
        setCountriesByContinent(continentMapping);
      } else {
        console.warn("InteractiveWorldMap: countryData is missing or invalid:", countryData);
      }

      // Handle world data in FeatureCollection format
      if (worldData && worldData.type === 'FeatureCollection' && worldData.features) {
        console.log("InteractiveWorldMap: worldData is valid FeatureCollection");
        // Filter out Antarctica and map regions to our continent information keys
        const continentNameMap = {
          "North America": "North America",
          "South America": "South America",
          "Europe": "Europe",
          "Asia": "Asia",
          "Africa": "Africa",
          "Oceania": "Oceania",
          // Add any other mappings needed
        };
        
        const filteredFeatures = worldData.features
          .filter(feature => feature.properties.name !== 'Antarctica')
          .map(feature => {
            // Map continent names to our continent info keys
            if (feature.properties.name && continentNameMap[feature.properties.name]) {
              feature.properties.continent = continentNameMap[feature.properties.name];
            }
            return feature;
          });
          
        setWorldGeographies({ ...worldData, features: filteredFeatures });
      } else {
        console.warn("InteractiveWorldMap: worldData is missing or invalid:", worldData);
      }
    } catch (error) {
      console.error("Error parsing GeoJSON:", error);
    }
  }, []);
  
  // Prepare MRO locations from the mroDataByCountry
  useEffect(() => {
    if (countryGeographies.length > 0 && mroDataByCountry) {
      const locations = [];
      
      // For each country that has MRO data
      Object.entries(mroDataByCountry).forEach(([countryName, mroList]) => {
        // Find the country in our geographies
        const country = countryGeographies.find(geo => 
          geo.properties.name === countryName || 
          geo.properties.name.includes(countryName)
        );
        
        if (country) {
          const centroid = geoCentroid(country);
          
          // Add each MRO with a slightly offset position to avoid overlap
          mroList.forEach((mro, index) => {
            // Small random offset for multiple MROs in the same country
            const offset = mroList.length > 1 
              ? [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2] 
              : [0, 0];
            
            locations.push({
              coordinates: [centroid[0] + offset[0], centroid[1] + offset[1]],
              mro: mro,
              country: countryName
            });
          });
        }
      });
      
      setMroLocations(locations);
    }
  }, [countryGeographies, mroDataByCountry]);

  const handleZoomIn = () => {
    setPosition(prev => ({ ...prev, zoom: prev.zoom * 1.2 }));
  };

  const handleZoomOut = () => {
    setPosition(prev => ({ ...prev, zoom: prev.zoom / 1.2 }));
  };

  const handleMoveEnd = (position) => {
    setPosition(position);
  };

  const handleGeographyClick = (geo) => {
    if (clickedGeo && clickedGeo.rsmKey === geo.rsmKey) {
      setPosition({ coordinates: PROJECTION_CONFIG.center, zoom: 1 });
      setClickedGeo(null);
      setIsZoomed(false);
      setSelectedContinent(null);
      setSelectedContinentName(null);
    } else {
      const centroid = geoCentroid(geo);
      setPosition({ coordinates: centroid, zoom: 4 });
      setClickedGeo(geo);
      setIsZoomed(true);
      
      // Set selected continent information
      const continentName = geo.properties.continent || geo.properties.name;
      console.log("Selected continent:", continentName);
      setSelectedContinentName(continentName);
      
      // Check if we have info for this continent
      if (continentInfo[continentName]) {
        setSelectedContinent(continentInfo[continentName]);
      } else {
        console.warn(`No continent info found for: ${continentName}`);
        // Set a default continent info if none exists
        setSelectedContinent({
          title: `${continentName} MRO Sektörü`,
          description: `${continentName} bölgesindeki MRO firmaları hakkında bilgi.`
        });
      }
    }
  };

  const handleCountryClickAfterZoom = (countryGeo) => {
    // Instead of alert, we'll show a modal with MRO details
    const countryName = countryGeo.properties.name;
    const countryMROs = mroDataByCountry[countryName];
    
    if (countryMROs && countryMROs.length > 0) {
      // If there's only one MRO, show it directly
      if (countryMROs.length === 1) {
        setSelectedMRO(countryMROs[0]);
      } 
      // If there are multiple MROs, let the user click on individual markers
      else if (onCountryClick) {
        onCountryClick(countryName);
      }
    }
  };
  
  const handleMROMarkerClick = (mro) => {
    setSelectedMRO(mro);
  };

  const handleMouseMove = (event) => {
    if (hoveredGeo) {
      setTooltipPosition({
        x: event.clientX,
        y: event.clientY
      });
    }
  };

  const getCountryColor = (countryName) => {
    if (mroDataByCountry && mroDataByCountry[countryName]) {
      return '#4CAF50';
    }
    return '#EAEAEC';
  };

  const getCountryTooltip = (countryName) => {
    if (mroDataByCountry && mroDataByCountry[countryName]) {
      const mroCount = mroDataByCountry[countryName].length;
      const mroNames = mroDataByCountry[countryName].map(mro => mro.mroFirmasiAdi).join(', ');
      return `<strong>${countryName}</strong><br/>${mroCount} MRO Firması: ${mroNames}`;
    }
    return `<strong>${countryName}</strong><br/>MRO bilgisi bulunamadı.`;
  };

  // Filter countries based on selected continent
  const filteredCountryGeographies = selectedContinentName 
    ? countryGeographies.filter(geo => geo.properties.continent === selectedContinentName)
    : countryGeographies;

  return (
    <div className="relative w-full h-full" onMouseMove={handleMouseMove}>
      <div className="flex flex-col h-full">
        {selectedContinent && (
          <div 
            className="mb-4 transition-all duration-500 ease-in-out transform"
            style={{ 
              opacity: selectedContinent ? 1 : 0,
              transform: selectedContinent ? 'translateY(0)' : 'translateY(-20px)'
            }}
          >
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-500 border border-gray-200">
              <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white px-5 py-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">{selectedContinent.title}</h3>
                <div className="text-xs bg-white bg-opacity-20 text-white py-1 px-2 rounded-full">
                  Bölge Bilgisi
                </div>
              </div>
              
              <div className="p-5">
                <p className="text-gray-700 mb-2 leading-relaxed border-l-4 border-primary-100 pl-3 py-1 bg-gray-50">
                  {selectedContinent.description}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className={`flex-grow rounded-lg overflow-hidden ${selectedContinent ? 'mt-2' : ''}`}>
          <ComposableMap projectionConfig={PROJECTION_CONFIG} className="w-full h-full">
            <ZoomableGroup
              center={position.coordinates}
              zoom={position.zoom}
              onMoveEnd={handleMoveEnd}
            >
              {worldGeographies && (
                <Geographies geography={worldGeographies}>
                  {({ geographies }) =>
                    geographies.map(geo => {
                      const isClickedContinent = clickedGeo && geo.rsmKey === clickedGeo.rsmKey;
                      const opacity = clickedGeo ? (isClickedContinent ? 1 : 0) : 1;
                      const isHovered = hoveredGeo && hoveredGeo.rsmKey === geo.rsmKey;
                      
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onClick={() => handleGeographyClick(geo)}
                          onMouseEnter={(event) => {
                            setHoveredGeo(geo);
                            setTooltipContent(geo.properties.name);
                            setTooltipPosition({
                              x: event.clientX,
                              y: event.clientY
                            });
                          }}
                          onMouseLeave={() => {
                            setHoveredGeo(null);
                            setTooltipContent("");
                          }}
                          style={{
                            default: {
                              fill: isClickedContinent ? '#EAEAEC' : '#D6D6DA',
                              outline: "none",
                              opacity: opacity,
                              transition: "all 0.3s ease",
                              stroke: isClickedContinent ? '#2196F3' : '#FFFFFF',
                              strokeWidth: isClickedContinent ? 1.5 : 0.5,
                            },
                            hover: {
                              fill: isClickedContinent ? '#EAEAEC' : '#F5F5F5',
                              outline: "none",
                              opacity: opacity,
                              transition: "all 0.3s ease",
                              stroke: '#E42325',
                              strokeWidth: 1,
                              cursor: 'pointer',
                            },
                            pressed: {
                              fill: "#E42325",
                              outline: "none",
                              transition: "all 0.3s ease",
                            },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              )}

              {isZoomed && filteredCountryGeographies.length > 0 && (
                <Geographies geography={{ type: "FeatureCollection", features: filteredCountryGeographies }}>
                  {({ geographies }) =>
                    geographies.map(geo => {
                      const countryName = geo.properties.name;
                      const hasMRO = mroDataByCountry && mroDataByCountry[countryName];
                      const countryOpacity = clickedGeo ? 1 : 0;
                      const isHovered = hoveredGeo && hoveredGeo.rsmKey === geo.rsmKey;

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onClick={() => handleCountryClickAfterZoom(geo)}
                          onMouseEnter={(event) => {
                            setHoveredGeo(geo);
                            setTooltipContent(
                              hasMRO 
                                ? `${countryName} (${mroDataByCountry[countryName].length} MRO Firması)`
                                : countryName
                            );
                            setTooltipPosition({
                              x: event.clientX,
                              y: event.clientY
                            });
                          }}
                          onMouseLeave={() => {
                            setHoveredGeo(null);
                            setTooltipContent("");
                          }}
                          style={{
                            default: {
                              fill: hasMRO ? '#FF5722' : '#EAEAEC',
                              stroke: '#FFFFFF',
                              strokeWidth: 0.5,
                              outline: "none",
                              opacity: countryOpacity,
                              transition: "all 0.3s ease",
                            },
                            hover: {
                              fill: hasMRO ? '#FF9800' : '#F5F5F5',
                              stroke: '#E42325',
                              strokeWidth: 1,
                              outline: "none",
                              opacity: countryOpacity,
                              transition: "all 0.3s ease",
                              cursor: 'pointer',
                            },
                            pressed: {
                              fill: "#FFC107",
                              outline: "none",
                              transition: "all 0.3s ease",
                            },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              )}
              
              {/* MRO Location Markers - Only show for countries in selected continent */}
              {isZoomed && mroLocations
                .filter(location => {
                  if (!selectedContinentName) return true;
                  // Find the country this MRO is in
                  const country = countryGeographies.find(geo => 
                    geo.properties.name === location.country || 
                    geo.properties.name.includes(location.country)
                  );
                  // Only show if the country is in the selected continent
                  return country && country.properties.continent === selectedContinentName;
                })
                .map((location, idx) => (
                  <MROLocationMarker
                    key={`mro-${idx}`}
                    coordinates={location.coordinates}
                    mroData={location.mro}
                    onMarkerClick={handleMROMarkerClick}
                  />
                ))
              }
            </ZoomableGroup>
          </ComposableMap>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 flex flex-col space-y-2 z-10">
        <button
          className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all duration-300"
          onClick={handleZoomIn}
          aria-label="Yakınlaştır"
        >
          +
        </button>
        <button
          className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all duration-300"
          onClick={handleZoomOut}
          aria-label="Uzaklaştır"
        >
          -
        </button>
      </div>

      {tooltipContent && (
        <div 
          className="absolute bg-white text-gray-800 text-sm rounded-md shadow-lg p-2 pointer-events-none whitespace-nowrap transform transition-all duration-200"
          style={{ 
            top: tooltipPosition.y - 40, 
            left: tooltipPosition.x,
            opacity: tooltipContent ? 1 : 0,
            transform: `translateX(-50%) translateY(${tooltipContent ? '0' : '10px'})`
          }}
        >
          {tooltipContent}
        </div>
      )}
      
      {/* MRO Details Popup */}
      {selectedMRO && (
        <MRODetailsPopup 
          mro={selectedMRO} 
          onClose={() => setSelectedMRO(null)} 
        />
      )}
    </div>
  );
};

export default InteractiveWorldMap;