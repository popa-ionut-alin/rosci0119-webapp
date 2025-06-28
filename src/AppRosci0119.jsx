import React, { useEffect, useRef, useState } from "react";
// import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { HashRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Mapping fișiere habitat
const habitatGeoJsonFiles = {
  "Turbarie cu vegetatie forestiera": "/turbarie_vegetatie_forestiera.geojson",
  "Pajisti montane de Nardus bogate in specii pe substraturi silicioase": "/pajisti_montane_cu_nardus.geojson",
  "Vegetatie herbacee de pe malurile raurilor montane": "/vegetatie_herbacee.geojson",
  "Tufarisuri alpine si boreale": "/tufarisuri_alpine_si_boreale.geojson",
  "Turbarii active": "/turbarii_active.geojson",
  "Bombina variegata": "/bombina.geojson",
};

// Mapping fișiere trasee
const traseeGeoJsonFiles = {
  "Traseu Statiunea Baisoara-Tinovul la Poduri-Platou Muntele Mare": "/Traseu Statiunea Baisoara-Tinovul la Poduri- Platou Muntele Mare.geojson",
  "Traseu Statiune Baisoara-Pietrele Cantatoare": "/Traseu Statiune Baisoara-Pietrele Cantatoare.geojson",
  "Traseu Platou Muntele Mare-Refugiu CAR": "/Traseu Platou Muntele Mare-Refugiu CAR.geojson",
  "Traseu Platou Muntele Mare-La morminte (monument istoric)": "/Traseu Platou Muntele Mare- La morminte (monument istoric).geojson",
};

// Culori pentru habitate
const habitatColors = {
  "Vegetatie herbacee de pe malurile raurilor montane": "#1f78b4",
  "Tufarisuri alpine si boreale": "#33a02c",
  "Pajisti montane de Nardus bogate in specii pe substraturi silicioase": "#e31a1c",
  "Turbarie cu vegetatie forestiera": "#ff7f00",
  "Turbarii active": "#f1c232",
  "Bombina variegata": "#000"
};

// Culori pentru trasee
const routeColors = {
  "Traseu Statiunea Baisoara-Tinovul la Poduri-Platou Muntele Mare": "#ff7800",
  "Traseu Statiune Baisoara-Pietrele Cantatoare": "#1f78b4",
  "Traseu Platou Muntele Mare-Refugiu CAR": "#e31a1c",
  "Traseu Platou Muntele Mare-La morminte (monument istoric)": "#6a3d9a",
};

// Detalii habitate cu cod și descriere
const habitatDetails = {
  "Vegetatie herbacee de pe malurile raurilor montane": {
    code: "3220",
    description: "Vegetație herbacee higrofilă de pe malurile râurilor montane, caracterizată prin specii adaptate la condiții de umiditate ridicată și fluctuații ale nivelului apei."
  },
  "Tufarisuri alpine si boreale": {
    code: "4060",
    description: "Tufarisuri caracteristice zonelor alpine și boreale, formate din specii rezistente la condiții climatice extreme și altitudini mari."
  },
  "Pajisti montane de Nardus bogate in specii pe substraturi silicioase": {
    code: "6230*",
    description: "Pajiști montane oligotrofe dominate de Nardus stricta, caracteristice substratului silicatic și cu o mare diversitate de specii. Habitat prioritar de conservare."
  },
  "Turbarie cu vegetatie forestiera": {
  code: "91D0*",
    description: "Turbării cu vegetație forestieră, ecosisteme unice care combină caracteristicile forestiere cu cele ale turbăriilor active. Habitat prioritar de conservare extrem de rar."
  },
  "Turbarii active": {
    code: "7110*",
    description: "Turbării active care produc turbă, ecosisteme extrem de valoroase pentru conservarea biodiversității și reglarea climatului. Habitat prioritar de conservare."
  },
  "Bombina variegata": {
    code: "Specie",
    description: "Bombina variegata (buhaiul de baltă cu burtă galbenă) - amfibian protejat, indicator al calității ecosistemelor acvatice montane."
  }
};

function ResetView({ center, zoom, version, bounds }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      // Zoom pe bounds-urile traseului
      map.fitBounds(bounds, { padding: [20, 20] });
    } else {
      // Zoom pe centrul default
      const TEMP_ZOOM = zoom - 1;
      map.setView(center, TEMP_ZOOM, { animate: false });
      setTimeout(() => {
        map.setView(center, zoom, { animate: true });
      }, 100);
    }
  }, [version, bounds]);

  return null;
}

function HabitatPage() {
  const [geoData, setGeoData] = useState(null);
  const [selectedHabitat, setSelectedHabitat] = useState(null);
  const [resetViewVersion, setResetViewVersion] = useState(0);
  const mapRef = useRef();

  useEffect(() => {
    if (!selectedHabitat || !habitatGeoJsonFiles[selectedHabitat]) {
      setGeoData(null);
      return;
    }

    fetch(`${process.env.PUBLIC_URL}${habitatGeoJsonFiles[selectedHabitat]}`)
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => {
        console.error(`Eroare la încărcarea GeoJSON pentru ${selectedHabitat}:`, err);
        setGeoData(null);
      });
  }, [selectedHabitat]);

  const onEachFeature = (feature, layer) => {
    const name = feature.properties?.HABITAT || "Zonă protejată";
    layer.bindPopup(`<strong>${name}</strong>`);
    layer.on({ click: () => setSelectedHabitat(name) });
  };

  const styleFeature = (feature) => {
    const name = feature.properties?.HABITAT;
    const color = habitatColors[name] || "#999";
    return { color: "#333", weight: 1, fillColor: color, fillOpacity: 0.6 };
  };

  const handleHabitatClick = (name) => {
    setSelectedHabitat(name === selectedHabitat ? null : name);
  };

  const resetHarta = () => {
    setSelectedHabitat(null);
    setGeoData(null);
    setResetViewVersion((v) => v + 1);
  };

  return (
    <div className="p-4 grid gap-6">
      <div className="border rounded p-4 bg-white shadow">
        <h2 className="text-xl font-semibold mb-4">Zone de habitat</h2>
        <button
          onClick={resetHarta}
          className="mb-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Resetează harta
        </button>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Selectează un habitat:</h3>
          <ul className="space-y-2">
            {Object.keys(habitatColors).map((item) => (
              <li
                key={item}
                className={`cursor-pointer p-2 rounded transition-colors ${
                  selectedHabitat === item
                    ? "bg-green-100 text-green-800 font-bold border-l-4 border-green-600"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
                onClick={() => handleHabitatClick(item)}
              >
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-3 border border-gray-300"
                    style={{ backgroundColor: habitatColors[item] }}
                  ></div>
                  <div>
                    <span className="font-medium">
                      {habitatDetails[item]?.code && `${habitatDetails[item].code}: `}
                    </span>
                    <span className="text-sm">{item}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {selectedHabitat && habitatDetails[selectedHabitat] && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-blue-900 text-lg">
                Cod: {habitatDetails[selectedHabitat].code}
              </h3>
              {habitatDetails[selectedHabitat].code.includes('*') && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                  Prioritar
                </span>
              )}
            </div>
            <h4 className="font-medium text-blue-800 mb-3 text-base">
              {selectedHabitat}
            </h4>
            <p className="text-sm text-blue-700 leading-relaxed">
              {habitatDetails[selectedHabitat].description}
            </p>
          </div>
        )}
      </div>

      <div className="border rounded p-4 bg-white shadow">
        <MapContainer
          center={[46.49, 23.27]}
          zoom={13}
          scrollWheelZoom
          style={{ height: "600px", width: "100%" }}
          whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ResetView center={[46.49, 23.27]} zoom={13} version={resetViewVersion} />
          {geoData && (
            <GeoJSON
              key={`${selectedHabitat}-${Date.now()}`}
              data={geoData}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

function EcoEducationPage() {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [resetViewVersion, setResetViewVersion] = useState(0);
  const [routeBounds, setRouteBounds] = useState(null);
  const mapRef = useRef();

  const calculateBounds = (geojsonData) => {
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    const processCoordinates = (coords) => {
      if (Array.isArray(coords[0])) {
        coords.forEach(processCoordinates);
      } else {
        const [lng, lat] = coords;
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      }
    };

    geojsonData.features.forEach(feature => {
      if (feature.geometry && feature.geometry.coordinates) {
        processCoordinates(feature.geometry.coordinates);
      }
    });

    return [[minLat, minLng], [maxLat, maxLng]];
  };

  useEffect(() => {
    if (!selectedRoute) {
      setRouteData(null);
      setRouteBounds(null);
      return;
    }
    fetch(`${process.env.PUBLIC_URL}${traseeGeoJsonFiles[selectedRoute]}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data); 
        setRouteData(data);
        const bounds = calculateBounds(data);
        setRouteBounds(bounds);
      })
      .catch((err) =>
        console.error(`Eroare la încărcarea GeoJSON pentru ${selectedRoute}:`, err)
      );
    setResetViewVersion((v) => v + 1);
  }, [selectedRoute]);

  const handleRouteClick = (route) => {
    setSelectedRoute(route === selectedRoute ? null : route);
  };

  const resetHarta = () => {
    setSelectedRoute(null);
    setRouteData(null);
    setRouteBounds(null);
    setResetViewVersion((v) => v + 1);
  };

  return (
    <div className="p-4 grid gap-6">
      <div className="border rounded p-4 bg-white shadow">
        <h2 className="text-xl font-semibold mb-4">Trasee montane eco</h2>
        
        <button
          onClick={resetHarta}
          className="mb-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Resetează harta
        </button>

        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Selectează un traseu:</h3>
          <ul className="space-y-2">
            {Object.keys(traseeGeoJsonFiles).map(route => (
              <li
                key={route}
                className={`cursor-pointer p-2 rounded transition-colors ${
                  selectedRoute === route
                    ? "bg-green-100 text-green-800 font-bold border-l-4 border-green-600"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
                onClick={() => handleRouteClick(route)}
              >
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-3 border border-gray-300"
                    style={{ backgroundColor: routeColors[route] }}
                  ></div>
                  <span className="text-sm">{route}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border rounded p-4 bg-white shadow">
        <MapContainer 
          center={[46.49, 23.27]} 
          zoom={13} 
          scrollWheelZoom 
          style={{ height: "600px", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          />
          <ResetView 
            center={[46.49, 23.27]} 
            zoom={13} 
            version={resetViewVersion} 
            bounds={routeBounds}
          />
          {routeData && (
            <GeoJSON 
              data={routeData} 
              style={() => ({ 
                color: routeColors[selectedRoute] || "#ff7800", 
                weight: 4 
              })} 
              key={`${selectedRoute}-${Date.now()}`} 
            />
          )}
        </MapContainer>
      </div>
      
      {selectedRoute && !routeData && (
        <p className="text-center text-gray-600">Se încarcă traseul...</p>
      )}
    </div>
  );
}


function ReportPage() {
  const [reportText, setReportText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  
  // Educational form state
  const [educationalForm, setEducationalForm] = useState({
    dataVizitei: "",
    numeVizitator: "",
    localitate: "",
    categorieVarsta: "",
    motivulVizitei: "",
    traseuVizitat: "",
    activitatiDesfasurate: "",
    speciiObservate: "",
    materialInformativ: "",
    tematiciEducate: "",
    aRespectatTrasee: "",
    aColectatGunoiul: "",
    aDeranjatFauna: "",
    gradSatisfactie: "",
    feedback: "",
    constatari: ""
  });

  const submitReport = () => {
    if (reportText.trim()) {
      setShowSuccess(true);
      setReportText("");
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const submitEducationalForm = () => {
    // Check if required fields are filled
    if (educationalForm.dataVizitei && educationalForm.numeVizitator) {
      setShowSuccess(true);
      setEducationalForm({
        dataVizitei: "",
        numeVizitator: "",
        localitate: "",
        categorieVarsta: "",
        motivulVizitei: "",
        traseuVizitat: "",
        activitatiDesfasurate: "",
        speciiObservate: "",
        materialInformativ: "",
        tematiciEducate: "",
        aRespectatTrasee: "",
        aColectatGunoiul: "",
        aDeranjatFauna: "",
        gradSatisfactie: "",
        feedback: "",
        constatari: ""
      });
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleEducationalFormChange = (field, value) => {
    setEducationalForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-4 grid gap-6 relative">
      <div className="border rounded p-4 bg-white shadow">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setActiveForm('educational')}
            className={`px-4 py-2 rounded transition-colors ${
              activeForm === 'educational'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Fișă educațională
          </button>
          <button
            onClick={() => setActiveForm('report')}
            className={`px-4 py-2 rounded transition-colors ${
              activeForm === 'report'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Raportare cetățenească
          </button>
        </div>

        {!activeForm && (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-4">Selectează tipul de formular</h2>
            <p className="text-gray-600">Alege dintre Fișa educațională sau Raportare cetățenească</p>
          </div>
        )}

        {activeForm === 'educational' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">FIȘĂ EDUCAȚIONALĂ A VIZITATORULUI</h2>
            <p className="mb-4 text-sm text-gray-600">Sit Natura 2000 ROSCI0119 „Muntele Mare"</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Data vizitei</label>
                  <input
                    type="date"
                    className="w-full border rounded p-2 text-sm"
                    value={educationalForm.dataVizitei}
                    onChange={(e) => handleEducationalFormChange('dataVizitei', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nume vizitator / Grup</label>
                  <input
                    type="text"
                    className="w-full border rounded p-2 text-sm"
                    value={educationalForm.numeVizitator}
                    onChange={(e) => handleEducationalFormChange('numeVizitator', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Localitate / Țară</label>
                  <input
                    type="text"
                    className="w-full border rounded p-2 text-sm"
                    value={educationalForm.localitate}
                    onChange={(e) => handleEducationalFormChange('localitate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categorie de vârstă</label>
                  <select
                    className="w-full border rounded p-2 text-sm"
                    value={educationalForm.categorieVarsta}
                    onChange={(e) => handleEducationalFormChange('categorieVarsta', e.target.value)}
                  >
                    <option value="">Selectează</option>
                    <option value="0-14">0-14 ani</option>
                    <option value="15-25">15-25 ani</option>
                    <option value="26-60">26-60 ani</option>
                    <option value="60+">60+ ani</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Motivul vizitei (turism, educație, cercetare etc.)</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 text-sm"
                  value={educationalForm.motivulVizitei}
                  onChange={(e) => handleEducationalFormChange('motivulVizitei', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Traseu / Zonă vizitată</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 text-sm"
                  value={educationalForm.traseuVizitat}
                  onChange={(e) => handleEducationalFormChange('traseuVizitat', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Activități desfășurate (drumeție, birdwatching, etc.)</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 text-sm"
                  value={educationalForm.activitatiDesfasurate}
                  onChange={(e) => handleEducationalFormChange('activitatiDesfasurate', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Specii / Habitate observate</label>
                <textarea
                  className="w-full border rounded p-2 text-sm"
                  rows={3}
                  value={educationalForm.speciiObservate}
                  onChange={(e) => handleEducationalFormChange('speciiObservate', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Material informativ primit (broșură, hartă, prezentare)</label>
                <input
                  type="text"
                  className="w-full border rounded p-2 text-sm"
                  value={educationalForm.materialInformativ}
                  onChange={(e) => handleEducationalFormChange('materialInformativ', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tematici educate discutate (biodiversitate, conservare, reguli)</label>
                <textarea
                  className="w-full border rounded p-2 text-sm"
                  rows={3}
                  value={educationalForm.tematiciEducate}
                  onChange={(e) => handleEducationalFormChange('tematiciEducate', e.target.value)}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Comportament al vizitatorului</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">A respectat traseele marcate</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="aRespectatTrasee"
                          value="Da"
                          checked={educationalForm.aRespectatTrasee === 'Da'}
                          onChange={(e) => handleEducationalFormChange('aRespectatTrasee', e.target.value)}
                          className="mr-2"
                        />
                        Da
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="aRespectatTrasee"
                          value="Nu"
                          checked={educationalForm.aRespectatTrasee === 'Nu'}
                          onChange={(e) => handleEducationalFormChange('aRespectatTrasee', e.target.value)}
                          className="mr-2"
                        />
                        Nu
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">A colectat gunoiul</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="aColectatGunoiul"
                          value="Da"
                          checked={educationalForm.aColectatGunoiul === 'Da'}
                          onChange={(e) => handleEducationalFormChange('aColectatGunoiul', e.target.value)}
                          className="mr-2"
                        />
                        Da
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="aColectatGunoiul"
                          value="Nu"
                          checked={educationalForm.aColectatGunoiul === 'Nu'}
                          onChange={(e) => handleEducationalFormChange('aColectatGunoiul', e.target.value)}
                          className="mr-2"
                        />
                        Nu
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">A deranjat fauna</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="aDeranjatFauna"
                          value="Da"
                          checked={educationalForm.aDeranjatFauna === 'Da'}
                          onChange={(e) => handleEducationalFormChange('aDeranjatFauna', e.target.value)}
                          className="mr-2"
                        />
                        Da
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="aDeranjatFauna"
                          value="Nu"
                          checked={educationalForm.aDeranjatFauna === 'Nu'}
                          onChange={(e) => handleEducationalFormChange('aDeranjatFauna', e.target.value)}
                          className="mr-2"
                        />
                        Nu
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Grad de satisfacție (1 = foarte nemulțumit, 5 = foarte mulțumit)</label>
                <select
                  className="w-full border rounded p-2 text-sm"
                  value={educationalForm.gradSatisfactie}
                  onChange={(e) => handleEducationalFormChange('gradSatisfactie', e.target.value)}
                >
                  <option value="">Selectează</option>
                  <option value="1">1 - Foarte nemulțumit</option>
                  <option value="2">2 - Nemulțumit</option>
                  <option value="3">3 - Neutru</option>
                  <option value="4">4 - Mulțumit</option>
                  <option value="5">5 - Foarte mulțumit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Feedback & sugestii</label>
                <textarea
                  className="w-full border rounded p-2 text-sm"
                  rows={4}
                  value={educationalForm.feedback}
                  onChange={(e) => handleEducationalFormChange('feedback', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Constatări ale personalului (pentru raport intern)</label>
                <textarea
                  className="w-full border rounded p-2 text-sm"
                  rows={3}
                  value={educationalForm.constatari}
                  onChange={(e) => handleEducationalFormChange('constatari', e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={submitEducationalForm}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Trimite fișa educațională
            </button>
          </div>
        )}

        {activeForm === 'report' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Raportare cetățenească</h2>
            <p className="mb-2">
              Completează o sesizare privind activități suspecte, faună/floră rare sau incidente ecologice.
            </p>
            <textarea
              className="w-full border rounded p-2 text-sm mb-2"
              rows={4}
              placeholder="Descrie observația sau incidentul aici..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
            />
            <button
              onClick={submitReport}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Trimite o raportare
            </button>
          </div>
        )}
      </div>
      
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-800 border border-green-400 px-6 py-4 rounded shadow-lg z-50">
          <strong className="block font-semibold mb-1">Succes!</strong>
          {activeForm === 'educational' ? 'Fișa educațională' : 'Raportarea'} a fost trimisă cu succes!
        </div>
      )}
    </div>
  );
}

export default function AppRosci0119() {
  return (
    <Router>
      <header className="bg-white shadow">
        <nav className="container mx-auto p-4 flex justify-end space-x-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-blue-600"
            }
          >
            Zone de habitat
          </NavLink>
          <NavLink
            to="/educatie"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-blue-600"
            }
          >
            Trasee montane eco
          </NavLink>
          <NavLink
            to="/raportare"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-blue-600"
            }
          >
            Fișă educațională / Raportare cetățenească
          </NavLink>
        </nav>
      </header>
      <main className="container mx-auto mt-6">
        <Routes>
          <Route path="/" element={<HabitatPage />} />
          <Route path="/educatie" element={<EcoEducationPage />} />
          <Route path="/raportare" element={<ReportPage />} />
        </Routes>
      </main>
    </Router>
  );
}
