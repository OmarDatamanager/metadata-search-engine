# Metadata-Sökmotor

Det här är en sökmotor för metadata som extraherar och söker i metadata från olika filtyper som PDF, bilder, ljudfiler och PowerPoint-dokument.

## Kom igång

1. Klona repositoriet
2. Installera paket: `npm install`
3. Konfigurera .env-fil med databasuppgifter
4. Starta servern: `node index.js`

## Vad vi har gjort hittills

### 1. Projektuppsättning
- Skapat Node.js-projekt med `npm init -y`
- Konfigurerat ES-moduler med `"type": "module"` i package.json
- Installerat nödvändiga npm-paket

### 2. Server och Databas
- Express-server med REST-API
- MySQL-databasanslutning med mysql2
- Skapat databastabell för metadata-lagring

### 3. Metadata-extrahering
- Stöd för PDF-filer med pdf-parse-fork
- Miljövariabler konfigurerade (.env-fil)
- Grundläggande struktur för framtida filtyper

### 4. Versionshantering
- Git-repository initierat
- Kod uppladdad till GitHub
- Känslig information skyddad (.gitignore)

## Tekniker använda
- **Backend**: Node.js, Express
- **Databas**: MySQL
- **Filbehandling**: pdf-parse-fork, exifr
- **Versionshantering**: Git, GitHub

---

# Branch: feature/image-extraction

## Syfte
Denna gren lägger till stöd för att extrahera metadata från bildfiler.

## Funktioner som lagts till
- Extrahering av metadata från bilder (JPG, JPEG, PNG) med biblioteket `exifr`
- Stöd för följande data:
  - Bilddimensioner (bredd och höjd)
  - Kamerainformation (tillverkare och modell)
  - GPS-koordinater (latitud och longitud)
  - Datum och tid när bilden togs

## Tekniska detaljer
- Använder `exifr` för att läsa EXIF-data från bilder
- Sparar metadata i JSON-format i MySQL-databasen
- Hanterar både horisontella och vertikala bilder
- Stöder automatisk rotation av bilder baserat på EXIF-data

## Installation
1. Installera required bibliotek:
```bash
npm install exifr
```

2. Lägg till bilder i mappen `files/image/`

3. Kör bildbehandlingen:
```bash
node image-extractor.js
```

## Användning
Systemet kommer automatiskt att extrahera metadata från alla bilder i mappen och spara dem i databasen. Data kan sedan sökas via webbgränssnittet.

---

# Projektstatus: Metadata-sökmotor

##  Översikt
Projektet har nått en fungerande prototyp med grundläggande funktionalitet för metadatahantering och visning.

##  Genomförda Milstolpar

### 1. Backend-infrastruktur
-  Express-server konfigurerad
-  MySQL-databasanslutning
-  REST API-endpoint (`/api/files`)
-  Stöd för metadataextrahering från PDF-filer
-  Stöd för metadataextrahering från bildfiler (EXIF)

### 2. Frontend-implementation
-  Grundläggande webbgränssnitt
-  Dynamisk datainhämtning via API
-  Responsiv design (i grunden)
-  Listvisning av filer och metadata

### 3. Databashantering
-  Tabellstruktur för metadata-lagring
-  JSON-lagring för flexibel datahantering
-  Stöd för flera filtyper i samma struktur

##  Teknisk Implementering

### Backend-stack
```javascript
Node.js + Express + MySQL2 + pdf-parse-fork + exifr
```

### Frontend-stack
```html
Vanilla JavaScript
```

##  Testresultat
-  API-endpoint returnerar korrekt JSON-data
-  Databasfrågor exekveras utan fel
-  Frontend hämtar och visar data korrekt
-  Metadata extraheras från både PDF och bildfiler

##  Nästa Fas
- Implementera sökfunktionalitet
- Utöka stöd för fler filtyper
- Förbättra användargränssnittet
- Optimera databassökningar