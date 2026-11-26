# SaludCerca León +

Aplicación web geo-referenciada para **encontrar y mantener actualizado el mapa de establecimientos de salud de León, Guanajuato**: hospitales, farmacias, laboratorios, consultorios y centros de salud, con su estado (Disponible / Saturado / Cerrado), zonas de cobertura dibujadas sobre el mapa y búsqueda de la atención más cercana a un punto.

Proyecto final — *Aplicación de Sistemas Geo-referenciados* (MTWDM).

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS 4, React Router |
| Mapa | Leaflet + react-leaflet, trazo de zonas con Leaflet-Geoman |
| Backend | Node.js + Express 5, organizado en config / models / routes / services / middlewares / utils |
| Base de datos | MongoDB Atlas + Mongoose (GeoJSON `Point` y `Polygon`, índices `2dsphere`) |
| Seguridad | Contraseñas con bcrypt, sesiones con JWT, credenciales solo en `.env` |

---

## 1. Ejecutar en local

Requisitos: **Node.js 18 o superior** y una base de datos en **MongoDB Atlas** (la capa gratuita M0 sirve).

### Backend

```bash
cd backend
npm install
cp .env.example .env        # en Windows: copy .env.example .env
# Edita .env y pega tu MONGODB_URI y un JWT_SECRET largo
npm run seed                # carga el usuario de prueba y datos de ejemplo
npm run dev                 # API en http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:4000/api
npm run dev                 # App en http://localhost:5173
```

### Usuario de prueba

| Correo | Contraseña |
|---|---|
| `demo@saludcerca.mx` | `Demo12345` |

(Se crea con `npm run seed`. Puedes cambiarlo con `SEED_USER_EMAIL` y `SEED_USER_PASSWORD` en el `.env`.)

> `npm run seed` solo carga datos si la base está vacía. `npm run seed -- --reset` **borra todo** y vuelve a cargar.
> Los establecimientos de ejemplo son **ficticios**, ubicados en colonias reales de León.

---

## 2. Vistas de la aplicación

| Ruta | Vista |
|---|---|
| `/acceso` | Inicio de sesión y registro (pestañas). Sin sesión no se entra a las demás vistas. |
| `/` | **Mapa principal**: clic en el mapa → registrar ubicación; clic en un marcador → popup para editar o eliminar ahí mismo; filtros; zonas; tabla en tiempo real. |
| `/cercanos` | **Atención cercana**: elige un punto (o tu ubicación) y obtén los establecimientos más cercanos ordenados por distancia (`$geoNear`). |
| `/catalogos` | CRUD de **Categorías**, **Especialidades** y **Médicos**. |

---

## 3. Estructura del backend

```
backend/src
├── config/        env.js (lee .env), db.js (conexión a Atlas)
├── models/        User, Category, Specialty, Doctor, Location (Point), Zone (Polygon)
├── routes/        Solo reciben la petición, llaman al servicio y responden
├── services/      Toda la lógica y las operaciones con MongoDB (uno por entidad)
├── middlewares/   auth (JWT), validate (reglas por entidad), validateId,
│                  notFound (404) y errorHandler (manejo centralizado)
├── utils/         AppError, jwt, geo (validación de coordenadas, cierre de anillos)
├── seed/          seed.js (datos de prueba)
├── app.js         Express + CORS + rutas + 404 + errorHandler
└── server.js      Conecta a MongoDB y levanta el servidor
```

### Modelos y relaciones (por referencia `ObjectId` + `populate`)

```
User ─┬─< Location >── Category        Location.geometry = GeoJSON Point [lng, lat]  (2dsphere)
      ├─< Zone                          Zone.geometry     = GeoJSON Polygon [[[lng, lat], ...]] (2dsphere)
      └─< (createdBy en todos)
Doctor >── Specialty
Doctor >── Location
```

- **Location → Category** y **Location → User** (quién la registró).
- **Doctor → Specialty** y **Doctor → Location** (dónde atiende).
- Al eliminar una ubicación se eliminan sus médicos; no se puede eliminar una categoría o especialidad que esté en uso (400 con mensaje claro).

### Endpoints

Todas las rutas, excepto `/api/auth/*`, requieren `Authorization: Bearer <token>` (401 si falta o expiró).

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Crear cuenta (201). Correo duplicado → 400 |
| POST | `/api/auth/login` | Iniciar sesión (200). Credenciales incorrectas → 401 |
| GET | `/api/auth/me` | Usuario de la sesión |
| GET | `/api/locations?search=&category=&status=&zone=&open24h=` | Lista con filtros resueltos en el backend |
| GET | `/api/locations/nearby?lng=&lat=&maxDistance=&category=&onlyAvailable=` | Más cercanos con distancia |
| GET/POST/PUT/DELETE | `/api/locations[/:id]` | CRUD de ubicaciones |
| GET/POST/PUT/DELETE | `/api/zones[/:id]` | CRUD de zonas (polígonos) |
| GET/POST/PUT/DELETE | `/api/categories[/:id]` | CRUD de categorías |
| GET/POST/PUT/DELETE | `/api/specialties[/:id]` | CRUD de especialidades |
| GET/POST/PUT/DELETE | `/api/doctors[/:id]` | CRUD de médicos |

Filtros de ubicaciones:
- `search`: nombre con texto parcial sin importar mayúsculas (`$regex` con opción `i`).
- `category`: ObjectId de la categoría.
- `status` (tercer filtro): `Disponible`, `Saturado` o `Cerrado`.
- `zone` (filtro geoespacial): solo puntos dentro del polígono (`$geoWithin`).
- `open24h=true`: solo los que abren 24 horas.

Formato de error (siempre igual, lo arma `errorHandler`):

```json
{ "ok": false, "status": 400, "message": "Revisa los datos enviados",
  "errors": [{ "field": "email", "message": "El correo no tiene un formato válido" }] }
```

---

## 4. Despliegue

### 4.1 MongoDB Atlas
1. Crea un cluster gratuito (M0) y un usuario de base de datos.
2. En **Network Access** agrega `0.0.0.0/0` (Render usa IPs variables).
3. **Connect → Drivers** y copia la cadena. Agrega el nombre de la base antes del `?`: `...mongodb.net/saludcerca?retryWrites=true&w=majority`.

### 4.2 Backend en Render
1. Sube este repositorio a GitHub.
2. Render → **New → Web Service** → elige el repo.
   - Root Directory: `backend` · Build: `npm install` · Start: `npm start`
   - (o usa **New → Blueprint** con el `render.yaml` de la raíz)
3. Variables de entorno: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=8h`, `NODE_ENV=production` y `CLIENT_URL` (la URL de Vercel, se llena en el paso 4.4).
4. Cuando termine, abre `https://TU-API.onrender.com/` → debe responder `{ "ok": true, ... }`.
5. Carga los datos de prueba una sola vez desde tu computadora, con tu `.env` apuntando a Atlas: `cd backend && npm run seed`.

> En el plan gratuito, Render "duerme" el servicio tras 15 min sin uso; la primera petición tarda ~50 s. Abre la URL de la API unos minutos antes de la revisión.

### 4.3 Frontend en Vercel
1. Vercel → **Add New → Project** → elige el repo.
   - Root Directory: `frontend` · Framework: Vite
   - Variable: `VITE_API_URL=https://TU-API.onrender.com/api`
2. Deploy. El archivo `frontend/vercel.json` hace que las rutas como `/catalogos` funcionen al recargar.
   (En Netlify usa base `frontend`, build `npm run build`, publish `dist`; el archivo `public/_redirects` cumple la misma función.)

### 4.4 Conectar ambos
En Render, pon `CLIENT_URL=https://TU-APP.vercel.app` (sin `/` final; varias separadas por coma) y reinicia el servicio para que CORS acepte al frontend.

---

## 5. Checklist de la rúbrica

| Requerimiento | Dónde está |
|---|---|
| Inicio de sesión | `pages/AuthPage.jsx` · `services/auth.service.js` (`bcrypt.compare`) · `components/ProtectedRoute.jsx` |
| Registro de usuarios | `AuthPage.jsx` pestaña *Crear cuenta* · `bcrypt.hash` · índice único en `email` |
| 3 CRUD + relación | Categorías, Especialidades, Médicos (`pages/CatalogPage.jsx`, `components/CrudSection.jsx`) · `populate` en `doctor.service.js` y `location.service.js` |
| Registro de ubicaciones | Clic en el mapa → popup con formulario (`components/HealthMap.jsx`, `LocationForm.jsx`) |
| Edición / eliminación en el popup | `components/LocationPopup.jsx` |
| Tabla en tiempo real | `components/LocationsTable.jsx` (se recarga tras cada cambio y cada 15 s) |
| Búsqueda y filtros | `components/FiltersPanel.jsx` → `GET /api/locations?search=&category=&status=&zone=` |
| Trazo de zonas | Leaflet-Geoman en `HealthMap.jsx` · `ZoneFormModal.jsx` · `services/zone.service.js` |
| Diseño (≥3 vistas) | `/acceso`, `/`, `/cercanos`, `/catalogos` + mensajes de éxito/error (`context/ToastContext.jsx`) |
| Estructura backend | `backend/src/*` (ver sección 3) |
