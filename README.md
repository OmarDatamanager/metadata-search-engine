# Metadata-Sökmotor

Det här är en sökmotor för metadata som extraherar och söker i metadata från olika filtyper som PDF, bilder, ljudfiler och PowerPoint-dokument.

## Kom igång

1. Klona repositoriet
2. Installera paket: `npm install`
3. Konfigurera .env-fil med databasuppgifter
4. Starta servern: `node index.js`

## Vad har gjort hittills

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

---

# Uppdatering: PowerPoint-metadata

## Genomfört
-  **Importering av PowerPoint-metadata** från CSV/JSON till MySQL-databasen
-  Använt färdig extraherad metadata från Library of Congress via Apache Tika
-  Automatisk konvertering av CSV till JSON via [csvjson.com](https://csvjson.com)
-  Datarensning: borttagning av tekniska fält (`digest`, `sha256`, `sha512`)

### Filtypshantering
- Bevarat originalfilnamn (baserat på `digest` + `.ppt`) för filåtervinning
- Renad metadata utan tekniska detaljer för användaren

## Nästa steg
- Integrera med sökgränssnittet
- Lägg till stöd för filnedladdning
- Utöka med fler filtyper

---

# Extrahering och lagring av ljudmetadata i databasen

## Genomfört
-  **Stöd för ljudfiler** tillagt i metadata-sökmotorn
-  Automatisk extrahering av metadata från MP3-filer med biblioteket `music-metadata`
-  Lagring av relevant metadata i MySQL-databasen
-  Filsystemet organiserat med ljudfiler i `files/audio/`

## Teknisk implementation
### Extraherade metadatafält
- **Basinformation** (`common`):
  - `title` (låtitel)
  - `artist` (artist/upphovsperson)
  - `album` (albumtitel)
  - `year` (utgivningsår)
  - `genre` (musikgenre)
  
- **Teknisk information** (`format`):
  - `duration` (speltid i sekunder)
  - `bitrate` (ljudkvalitet i bit/s)

### Databasintegration
```sql
INSERT INTO files (filename, file_type, metadata_json) VALUES
('låtfil.mp3', 'audio', '{"title": "Låttitel", "artist": "Artistnamn", ...}')
```

## Användning
1. Placera MP3-filer i mappen `files/audio/`
2. Kör metadata-extrahering:
   ```bash
   node audio-extractor.js
   ```

## Datafällor hanterade
- Saknade metadatafält ersätts med standardvärden ("Okänd titel")
- Automatisk felhantering vid korrupta eller saknade filer

---

# Bildmetadata har processats och lagts till i databasen

## Genomfört
-  **Bildmetadata extraherad** från alla bildfiler i `files/image/`
-  **Relevanta fält har valts ut** för sökning och visning:
  - `camera_make` (t.ex. "Apple")
  - `camera_model` (t.ex. "iPhone 15 Pro")
  - `date_taken` (datum när bilden togs)
  - `gps` (geografiska koordinater)
  - `width` och `height` (bilddimensioner)
  - Tekniska data (`iso`, `exposure_time`, `f_number`)
-  **Data har lagrats** i MySQL-tabellen `files` som JSON


### Datainsamling
- **Antal bilder processade**: Alla bilder i mappen `files/image/`
- **Filformat som stöds**: JPG, JPEG, PNG
- **GPS-data extraherad** för bilder med geotagging

## Nuvarande status
Alla planerade filtyper har nu metadata i databasen:
-  **PDF-filer** (via pdf-parse-fork)
-  **Ljudfiler** (MP3 via music-metadata)  
-  **Bilder** (JPG/PNG via exifr)
-  **PowerPoint** (via färdig JSON-metadata)

---

# Statusrapport: Utveckling av Metadata-Sökmotorn

## Genomförda Förbättringar

### 1. Databassstruktur och Import
-  **MySQL-databas** med tabellen `files` skapad
-  **Stöd för flera filtyper**: PDF, bilder, ljud, PowerPoint
-  **Metadataextrahering** från alla filtyper
-  **JSON-lagring** för flexibel datahantering

### 2. Backend-Utveckling
-  **Express-server** med REST API
-  **Sök-API** (`/api/search`) med LIKE-sökning
-  **Hämtning av alla filer** (`/api/files`)

### 3. Frontend-Gränssnitt
-  **Grundläggande sökgränssnitt** i `index.html`
-  **Dynamisk resultatvisning** med JavaScript
-  **Responsiv design** (i grunden)

## Tekniska Utmaningar och Lösningar

### Problem 1: Databasanslutning
- **Fel**: `Connection refused` 
- **Lösning**: Korrigerade `db.js` med rätt inloggningsuppgifter

### Problem 2: JSON-sökning
- **Fel**: `LIKE`-sökning hittade inte alla resultat
- **Lösning**: Implementerade `JSON_EXTRACT` för bättre sökning

### Problem 3: Filtypshantering
- **Utmaning**: Olika metadata för olika filtyper
- **Lösning**: Enhetlig JSON-struktur med specifika fält

### Problem 4: Prestanda
- **Utmaning**: Långsamma sökningar med `LIKE`
- **Lösning**: Planerar implementering av `FULLTEXT`-index

## Nuvarande Status
-  **Sökfunktion fungerar** för enkla söktermer
-  **Webbgränssnittet responserar** på sökningar

## Kända Begränsningar
-  **Fulltext-sökning behöver optimeras**
-  **Frontend behöver förbättrat UX**
-  **Sökningen är case-sensitive**

## Nästa Steg
1. Implementera `FULLTEXT`-index för snabbare sökning
2. Lägga till avancerade filter (datum, filtyp, etc.)
3. Förbättra användargränssnittet med CSS
4. Lägga till sidbrytning för resultat

---

# Förbättring av metadata-visning

I projektets tidigare version visades metadata i frontend som rå JSON eller med fasta fält för varje filtyp (t.ex. date_taken, camera_make för bilder, title, artist för ljudfiler osv.). Detta fungerade inte alltid eftersom vissa filer hade olika strukturer eller saknade vissa fält, vilket ledde till att metadata inte visades korrekt.
För att lösa detta implementerades en mer flexibel renderingsfunktion som:

* Itererar genom hela metadata-objektet rekursivt, oavsett hur många nivåer av nyckel-värde-par som finns.
* Visar både enkla värden och inbäddade objekt utan att förlita sig på specifika fältnamn.
* Behandlar saknade eller `null` värden på ett konsekvent sätt med en standard "-" som visning.
* Gör det enkelt att lägga till nya metadatafält i framtiden utan att ändra frontend-koden.

Dessutom lades en **dropdown-lista för filtyp** till, så att användaren kan filtrera sökresultaten efter filtyp (bilder, ljud, PDF, PowerPoint).

Tekniska exempel på nyligen använda lösningar:

* **JavaScript**: rekursiv funktion `renderMetadata` för dynamisk rendering av metadataobjekt.
* **Node.js / Express**: REST-API för att söka i metadata som lagrats i MySQL.
* **MySQL**: lagring av metadata som JSON, vilket möjliggör flexibel sökning och filtrering.
* **Frontend**: enkel visning med HTML och CSS, där varje fil visas i en “result-card” med metadata listade på ett organiserat sätt.

Resultatet är en mer robust och användarvänlig presentation av metadata för alla filtyper, där användaren kan se all tillgänglig information på ett tydligt sätt.

---

# Förhandsvisning av bilder och ljudfiler

* **Bildförhandsvisning**: Bilder visas nu som **miniaturer** (thumbnails) i resultatkorten, med automatisk storleksanpassning för ett enhetligt utseende.
* **Ljuduppspelning**: Ljudfiler kan spelas upp direkt via en inbäddad **HTML5-audio player** i resultatkorten.
* **Responsiva resultatkort**: Alla filer (bilder, ljud m.m.) presenteras i **kortlayout** med tydlig struktur och skuggor för bättre användarupplevelse.

###  Designförbättringar

* Ny **style.css** som hanterar layout, kortdesign, knappar och inputfält.
* Bilder är nu **skalade och beskurna** (`object-fit: cover`) för att undvika för stora visningar.
* **Hover-effekter** på korten för ett mer interaktivt gränssnitt.

###  Tekniska förbättringar

* Servern är uppdaterad för att korrekt serva statiska filer från:

  * `files/image` för bilder
  * `files/audio` för ljud
* Buggen med laddning av CSS (fel MIME-typ) är åtgärdad genom att flytta **style.css** till `frontend/`-mappen.

###  Nästa steg (planerat)

* Lägga till **förhandsvisning av PDF och PowerPoint** (t.ex. via ikoner, thumbnails eller inline viewers).
* Implementera **avancerade filter** i sökningen (t.ex. filtyp, datum, storlek).
* Förbättra **relevanssortering** i sökresultaten för bättre träffsäkerhet.

---

### Ny funktion: ISO-filter för bilder

Nu kan användaren filtrera bildfiler baserat på ISO-värden inom olika intervall (t.ex. 0–50, 51–100, 101–150 osv.). Detta gör det lättare att hitta bilder med specifika ljusförhållanden eller kvalitetsnivåer.

### Teknisk beskrivning

* Filtreringen sker på serversidan via REST API\:t `/api/search`.
* För bildfiler kontrolleras metadatafältet `iso` och jämförs med det valda intervallet (`isoRange`).
* Frontend skickar `isoRange` som URL-parameter till API\:t, som sedan använder `JSON_EXTRACT` i SQL-frågan för att hämta rätt filer.
* Filtren är dynamiska och visas endast när användaren väljer "Bilder" i filtypens dropdown.

---

## Bildfiltrering med Bländare (f)

Den senaste uppdateringen introducerar avancerad filtrering för bildfiler:

- **Bländare (f_number) filter**: Filtrering baserat på kamerans bländare. Värden kan väljas i steg om 0.5 mellan <3 och 10, samt alternativ för "Mindre än 3" och "Större än 10".
- **Dynamisk visning**: Filtrena visas endast när användaren har valt "Bilder" från huvudfiltypmenyn.
- **UI-anpassning**: Filtrena ligger horisontellt under sökfältet och kan enkelt utökas med fler filter i framtiden.
- **Backend-integration**: API:et tar emot filtreringsparametrar (`isoRange` och `fNumber`) och returnerar endast bilder som matchar de valda kriterierna.
