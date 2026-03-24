# SNCF Open Data: Train Schedules Research

**Date**: 2026-03-23
**Purpose**: Understand what SNCF provides for train schedule data (GTFS, APIs, real-time)

---

## 1. GTFS Datasets Available

### Consolidated National Dataset (PRIMARY - recommended)

SNCF has consolidated TGV, TER, and Intercites into a **single national GTFS feed**:

| Field | Value |
|-------|-------|
| **Name** | Horaires SNCF (TGV + Intercites + TER) |
| **GTFS Download** | `https://eu.ftp.opendatasoft.com/sncf/plandata/Export_OpenData_SNCF_GTFS_NewTripId.zip` |
| **NeTEx Download** | `https://eu.ftp.opendatasoft.com/sncf/plandata/export-opendata-sncf-netex.zip` |
| **Coverage** | TER + TGV/InOui + Intercites operated by SNCF Voyageurs |
| **Time horizon** | Next **151 days** of theoretical schedules |
| **Portal page** | https://ressources.data.sncf.com/explore/dataset/horaires-sncf/ |
| **transport.data.gouv.fr** | https://transport.data.gouv.fr/datasets/horaires-sncf |

> **Important**: SNCF merged the formerly separate TER, TGV, and Intercites datasets into this single consolidated dataset. The separate sectoral datasets were decommissioned during summer 2025.

### Legacy Separate Datasets (may still work, but deprecated)

| Dataset | Download URL | Status |
|---------|-------------|--------|
| TER only | `https://eu.ftp.opendatasoft.com/sncf/gtfs/export-ter-gtfs-last.zip` | Deprecated summer 2025 |
| Intercites only | `https://eu.ftp.opendatasoft.com/sncf/plandata/export-intercites-gtfs-last.zip` | Deprecated summer 2025 |
| Transilien (Ile-de-France) | `https://eu.ftp.opendatasoft.com/sncf/gtfs/transilien-gtfs.zip` | Separate dataset, still active |

### Regional TER Datasets

There are **no per-region GTFS feeds** from SNCF. The TER data is national. However, some regions publish their own transport feeds on transport.data.gouv.fr (e.g., BreizhGo for Bretagne), but these are typically published by the regional transport authority, not SNCF directly.

### Transilien (Ile-de-France suburban)

Transilien remains a **separate** GTFS feed (not included in the consolidated dataset):
- **URL**: `https://eu.ftp.opendatasoft.com/sncf/gtfs/transilien-gtfs.zip`
- **Portal**: https://ressources.data.sncf.com/explore/dataset/sncf-transilien-gtfs/

---

## 2. GTFS Format Details

### Standard GTFS Files Expected in SNCF Feed

A SNCF GTFS zip contains the standard GTFS text files:

| File | Purpose | Key fields |
|------|---------|------------|
| `agency.txt` | Transport operator(s) | `agency_id`, `agency_name` (SNCF Voyageurs) |
| `routes.txt` | Train lines/routes | `route_id`, `route_short_name`, `route_long_name`, `route_type` |
| `trips.txt` | Individual train runs | `trip_id`, `route_id`, `service_id`, `trip_headsign`, `trip_short_name` (train number) |
| `stop_times.txt` | Departure/arrival at each stop | `trip_id`, `stop_id`, `arrival_time`, `departure_time`, `stop_sequence` |
| `stops.txt` | Stations | `stop_id`, `stop_name`, `stop_lat`, `stop_lon` |
| `calendar.txt` | Service patterns (day of week) | `service_id`, `monday`..`sunday`, `start_date`, `end_date` |
| `calendar_dates.txt` | Exceptions to calendar | `service_id`, `date`, `exception_type` |
| `transfers.txt` | Transfer rules between stops | `from_stop_id`, `to_stop_id`, `transfer_type`, `min_transfer_time` |
| `shapes.txt` | Geographic route shapes (optional) | `shape_id`, `shape_pt_lat`, `shape_pt_lon` |

### Can We Extract What We Need?

#### All train departures for origin -> destination on a given date?

**Yes, but requires multi-step processing:**
1. Find `stop_id` for origin and destination stations in `stops.txt`
2. Check `calendar.txt` + `calendar_dates.txt` to find which `service_id` values are active on the target date
3. Find all `trip_id` in `trips.txt` that match active `service_id` values
4. In `stop_times.txt`, find trips that stop at both origin AND destination, with origin `stop_sequence` < destination `stop_sequence`
5. Extract departure/arrival times

This is a **multi-file join** across 4+ files. Feasible but non-trivial.

#### Train numbers, departure/arrival times?

**Yes:**
- `trip_short_name` in `trips.txt` = commercial train number (e.g., "TER 86417", "TGV 6789")
- `departure_time` / `arrival_time` in `stop_times.txt`

#### Distinguish TER vs Intercites vs TGV?

**Likely yes, through multiple fields:**
- `agency_id` in `routes.txt` may differentiate operators
- `route_type` in `routes.txt` (standard GTFS uses `2` = Rail, but extended types exist: `100` = Railway, `101` = High Speed Rail, `102` = Long Distance Rail, `103` = Inter Regional Rail, `106` = Regional Rail)
- `route_short_name` or `route_long_name` may contain "TER", "TGV", "IC" prefixes
- `trip_short_name` often contains the train type prefix

**Note**: The exact field used depends on SNCF's implementation. You need to download and inspect the actual feed to confirm which field reliably distinguishes train types.

---

## 3. GTFS-RT (Realtime)

### Available Feeds

SNCF provides GTFS-RT feeds freely accessible (no API key required) via the transport.data.gouv.fr proxy:

| Feed | URL | Format | Update frequency |
|------|-----|--------|-----------------|
| **Trip Updates** (delays) | `https://proxy.transport.data.gouv.fr/resource/sncf-gtfs-rt-trip-updates` | Protobuf | Every **2 minutes** |
| **Service Alerts** (disruptions) | `https://proxy.transport.data.gouv.fr/resource/sncf-gtfs-rt-service-alerts` | Protobuf | Continuous |

### Key Details

- **Trip Updates** cover trains running in the **next 60 minutes** - provides delay information (arrival/departure delay in seconds per stop)
- **Service Alerts** cover upcoming scheduled disruptions and cancellations
- **Format**: Protocol Buffers (binary format) - requires a protobuf decoder
- **Free access**: No API key needed for the proxy.transport.data.gouv.fr endpoints
- **Coverage**: TGV, TER, and Intercites (same scope as the consolidated GTFS)
- **SIRI Lite** alternatives also exist:
  - SIRI ET Lite (Estimated Timetable): `https://proxy.transport.data.gouv.fr/resource/sncf-siri-lite-estimated-timetable`
  - SIRI SX Lite (Situation Exchange): `https://proxy.transport.data.gouv.fr/resource/sncf-siri-lite-situation-exchange`

### Correlation with Static GTFS

The `trip_id` in GTFS-RT Trip Updates corresponds to the `trip_id` in the static GTFS feed, allowing you to match real-time delays with scheduled times.

---

## 4. File Sizes

### Estimated Sizes (based on available data)

| Dataset | Zip size | Uncompressed estimate |
|---------|----------|----------------------|
| TER-only GTFS (legacy) | ~2 MB | ~15-20 MB |
| Consolidated (TGV+TER+IC) | ~5-15 MB (estimated) | ~50-150 MB (estimated) |
| `stops.txt` | ~760 KB (8,600+ stops) | - |
| `stop_times.txt` | Largest file | Likely **millions of rows** |

### Can We Load in a Browser?

**Short answer: Not the full feed.**

- `stop_times.txt` for a national 151-day feed is likely **several million rows** and tens to hundreds of MB uncompressed
- Loading + parsing this in a browser with JavaScript would be very slow and memory-intensive
- **Realistic browser strategies:**
  - **Pre-process server-side**: Build a search index or database from GTFS, serve via API
  - **Use the Navitia/SNCF API** instead of raw GTFS for real-time queries
  - **Filter at download time**: Only load specific routes/regions if using GTFS directly
  - **Use a web worker + streaming parser**: Parse CSV incrementally, but still problematic for full dataset
  - **IndexedDB**: Store parsed data in browser IndexedDB for repeat access, but initial load is slow

**Recommendation**: For a browser app, use the **Navitia/SNCF API** for schedule queries rather than loading raw GTFS files.

---

## 5. API Alternatives for Schedules

### Option A: Navitia API via api.sncf.com (RECOMMENDED)

| Field | Value |
|-------|-------|
| **Base URL** | `https://api.sncf.com/v1/` |
| **Coverage** | `sncf` (national: TGV, TER, Intercites, Transilien) |
| **Auth** | Basic Auth (username = API key, password = empty) |
| **Registration** | Free at https://numerique.sncf.com/startup/api/ |
| **Rate limits** | 90,000 requests/month, 3,000/day (free tier) |
| **Data** | Theoretical + Real-time (TGV, TER, Intercites) |
| **Format** | JSON (HATEOAS) |

#### Key Endpoints

**Journeys** (route computation):
```
GET /v1/coverage/sncf/journeys?from={stop_area_id}&to={stop_area_id}&datetime={YYYYMMDDTHHMMSS}
```
Returns multiple journey options with departure/arrival times, transfers, durations.

**Departures** (departure board):
```
GET /v1/coverage/sncf/stop_areas/{stop_area_id}/departures?from_datetime={YYYYMMDDTHHMMSS}
```
Returns next departures from a station, like a station departure board.

**Stop Schedules** (timetable for a line at a stop):
```
GET /v1/coverage/sncf/stop_areas/{stop_area_id}/stop_schedules?from_datetime={YYYYMMDDTHHMMSS}
```
Returns departures grouped by route.

**Disruptions** (delays/cancellations):
```
GET /v1/coverage/sncf/disruptions?since={YYYYMMDDTHHMMSS}
```

**Places** (search for stations):
```
GET /v1/coverage/sncf/places?q=Lyon+Part+Dieu
```

#### Station IDs
Format: `stop_area:OCE:SA:{UIC_code}` (e.g., `stop_area:OCE:SA:87345025`)

#### Example: Query departures from Lyon Part-Dieu
```
GET https://api.sncf.com/v1/coverage/sncf/stop_areas/stop_area:OCE:SA:87723197/departures
Authorization: Basic {your_api_key_base64}
```

### Option B: Navitia.io (same engine, different coverage)

| Field | Value |
|-------|-------|
| **Base URL** | `https://api.navitia.io/v1/` |
| **Registration** | https://navitia.io |
| **Rate limits** | 5,000 requests/day (free tier) |
| **Coverage** | Multiple regions including France |

Same API structure as api.sncf.com but with broader European coverage.

### Option C: SNCF Open Data Portal API (ressources.data.sncf.com)

| Field | Value |
|-------|-------|
| **Base URL** | `https://ressources.data.sncf.com/api/explore/v2.1/` |
| **Auth** | None required for public datasets |
| **Console** | https://ressources.data.sncf.com/api/explore/v2.1/console |

This is an OpenDataSoft-based API for querying the datasets hosted on the portal. It provides access to structured data exports but is **not designed for schedule queries** (it serves the raw dataset records, not journey planning).

### Option D: SNCF Connect (No public API)

SNCF Connect (formerly OUI.sncf) has internal APIs (BFF) for its web/mobile apps, but:
- **No public/documented API** for third-party use
- Endpoints are undocumented, rate-limited, and may change without notice
- Not recommended for production use

---

## 6. Summary of All URLs

### GTFS Static Downloads

| Resource | URL |
|----------|-----|
| **National GTFS (TGV+TER+IC)** | `https://eu.ftp.opendatasoft.com/sncf/plandata/Export_OpenData_SNCF_GTFS_NewTripId.zip` |
| **National NeTEx** | `https://eu.ftp.opendatasoft.com/sncf/plandata/export-opendata-sncf-netex.zip` |
| Transilien GTFS | `https://eu.ftp.opendatasoft.com/sncf/gtfs/transilien-gtfs.zip` |
| TER only (deprecated) | `https://eu.ftp.opendatasoft.com/sncf/gtfs/export-ter-gtfs-last.zip` |
| Intercites only (deprecated) | `https://eu.ftp.opendatasoft.com/sncf/plandata/export-intercites-gtfs-last.zip` |

### GTFS-RT Realtime Feeds

| Resource | URL | Format |
|----------|-----|--------|
| **Trip Updates** | `https://proxy.transport.data.gouv.fr/resource/sncf-gtfs-rt-trip-updates` | Protobuf |
| **Service Alerts** | `https://proxy.transport.data.gouv.fr/resource/sncf-gtfs-rt-service-alerts` | Protobuf |
| SIRI ET Lite | `https://proxy.transport.data.gouv.fr/resource/sncf-siri-lite-estimated-timetable` | JSON/XML |
| SIRI SX Lite | `https://proxy.transport.data.gouv.fr/resource/sncf-siri-lite-situation-exchange` | JSON/XML |

### APIs

| API | Base URL | Auth | Free Tier |
|-----|----------|------|-----------|
| **SNCF API (Navitia)** | `https://api.sncf.com/v1/` | Basic Auth (API key) | 90K req/month |
| Navitia.io | `https://api.navitia.io/v1/` | Basic Auth (token) | 5K req/day |
| SNCF Open Data Portal | `https://ressources.data.sncf.com/api/explore/v2.1/` | None | Unlimited |

### Portal Pages

| Resource | URL |
|----------|-----|
| SNCF Open Data portal | https://ressources.data.sncf.com/pages/accueil/ |
| Dataset page (schedules) | https://ressources.data.sncf.com/explore/dataset/horaires-sncf/ |
| transport.data.gouv.fr page | https://transport.data.gouv.fr/datasets/horaires-sncf |
| SNCF API registration | https://numerique.sncf.com/startup/api/ |
| Navitia documentation | https://doc.navitia.io/ |
| SNCF API GitHub docs | https://github.com/SNCFdevelopers/API-trains-sncf |

---

## 7. Recommendations for a Web App

1. **For schedule queries (origin->destination, date)**: Use the **Navitia API via api.sncf.com**. It handles all the GTFS complexity server-side and returns clean JSON with journeys, times, train numbers, and disruptions.

2. **For real-time delays**: Use **GTFS-RT Trip Updates** (free, no auth) or the Navitia API disruptions endpoint.

3. **For offline/static analysis**: Download the consolidated GTFS and process it with a backend (Node.js, Python, etc.) - do NOT try to parse it in the browser.

4. **For a pure client-side app with no backend**: The Navitia API is the only realistic option. GTFS files are too large for browser-side processing. The API key would need to be proxied to avoid exposing it in client code.

5. **CORS considerations**: The GTFS-RT proxy endpoints (proxy.transport.data.gouv.fr) may or may not support CORS. The Navitia API supports CORS. This needs to be tested.
