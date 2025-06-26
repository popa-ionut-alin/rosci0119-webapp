# Aplicație interactivă ROSCI0119 – Muntele Mare

Această aplicație web React oferă o hartă interactivă pentru situl Natura 2000 ROSCI0119 – Muntele Mare.

## Funcționalități principale
- Hartă interactivă cu limite reale (GeoJSON)
- Afișare popup și evidențiere la click pe habitat
- Filtrare habitat din listă
- Paletă de culori și legendă pentru habitate
- Informații educaționale și trasee eco
- Modul de raportare cetățenească (în lucru)

## Tehnologii
- React + React Leaflet
- Leaflet.js
- OpenStreetMap tiles
- GeoJSON

## Instalare și rulare

1. Dezarhivează proiectul:
```
unzip rosci0119_app_react.zip
cd rosci0119_app_react
```

2. Instalează pachetele necesare:
```
npm install
```

3. Rulează aplicația:
```
npm start
```

Aplicația se va deschide automat în browser la `http://localhost:3000`.

## Notă
Asigură-te că fișierul `rosci0119_limite_combinate.geojson` se află în directorul `public/` pentru a fi accesibil aplicației.

## Licență
Această aplicație este destinată uzului educațional și cercetării în domeniul protecției mediului.
