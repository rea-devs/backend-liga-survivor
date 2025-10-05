# Survivor Game - Prueba Técnica Fullstack

## Descripción del Proyecto

Implementación de un juego Survivor donde los usuarios deben elegir equipos ganadores cada jornada para mantenerse en la competencia. El objetivo es sobrevivir la mayor cantidad de jornadas posibles sin quedarse sin vidas.

## Tecnologías Utilizadas

### Backend
- Node.js con Express
- MongoDB con Mongoose
- Docker para base de datos
- CORS para manejo de peticiones cross-origin

### Frontend
- Flutter
- HTTP package para comunicación con API

## Instrucciones de Instalación y Ejecución

### Requisitos Previos
- Node.js (versión 14 o superior)
- Docker Desktop
- Flutter SDK (para el frontend)
- Git

### Backend

#### Opción 1: Usando Docker (Recomendado)

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd project/backend
```

2. Iniciar la base de datos MongoDB con Docker:
```bash
docker-compose up -d
```

3. Instalar dependencias:
```bash
npm install
```

4. Configurar variables de entorno:
```bash
cp .env.template .env
```
Editar `.env` y configurar:
```
MONGO_URI=mongodb://root:example@localhost:27017/survivor?authSource=admin
PORT=4000
```

5. Poblar la base de datos con datos de ejemplo:
```bash
npm run seed
```

6. Iniciar el servidor:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:4000`

#### Opción 2: MongoDB Local

Si prefieres usar MongoDB instalado localmente:

1. Instalar y configurar MongoDB localmente
2. En el archivo `.env` usar:
```
MONGO_URI=mongodb://localhost:27017/survivor
```

### Frontend (Flutter)

1. Navegar al directorio del frontend:
```bash
cd ../frontend
```

2. Instalar dependencias:
```bash
flutter pub get
```

3. Ejecutar la aplicación:
```bash
flutter run
```

Nota: Para emulador Android, la URL base de la API debe ser `http://10.0.2.2:4000`

## Estructura del Proyecto

### Backend
```
backend/
├── models/           # Modelos de Mongoose
│   ├── Survivor.js   # Modelo principal del juego
│   ├── Gamble.js     # Participación de usuario en survivor
│   ├── Match.js      # Partidos/encuentros
│   └── Prediction.js # Predicciones de usuarios
├── routes/           # Rutas de la API
│   ├── index.js      # Rutas principales
│   └── survivor.js   # Rutas específicas del survivor
├── seed/             # Scripts de inicialización
│   ├── seed.js       # Poblado inicial de datos
│   └── simulate.js   # Simulación de resultados
└── server.js         # Punto de entrada
```

### API Endpoints

- `GET /` - Obtener lista de survivors con información de participantes
- `POST /survivor/join/:survivorId` - Unirse a un survivor (requiere userId en query)
- `POST /survivor/pick` - Realizar predicción de equipo
- `GET /gamble/:survivorId/:userId` - Obtener estado detallado de un gamble

## Scripts Disponibles

- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor en desarrollo (con nodemon)
- `npm run seed` - Poblar base de datos con datos de ejemplo
- `npm run simulate` - Simular resultados de partidos y actualizar vidas

## Decisiones de Desarrollo

### Arquitectura Backend

1. **Separación de Modelos**: Se crearon modelos separados para `Survivor`, `Gamble`, `Match` y `Prediction` para mantener una estructura de datos normalizada y facilitar las consultas.

2. **Modelo de Gamble**: Se decidió crear un modelo intermedio `Gamble` que relaciona a un usuario con un survivor específico, permitiendo trackear vidas individuales y estado de eliminación.

3. **Sistema de Vidas**: Se implementó un sistema donde cada jugador tiene `livesLeft` que se reduce cuando su predicción es incorrecta, manteniendo el `lives` original del survivor como configuración base.

4. **Simulación de Partidos**: Se creó un script separado para simular resultados, permitiendo probar la lógica del juego de manera controlada.

### Arquitectura Frontend

1. **Gestión de Estado Local**: Se utilizó StatefulWidget para manejar el estado local de la página, incluyendo vidas actuales y selecciones del usuario.

2. **Actualización de Datos**: Se implementó una función de refresh para sincronizar datos con el servidor después de simulaciones.

3. **UX/UI Responsiva**: Se diseñó una interfaz que muestra claramente el estado del juego, vidas restantes, y resultados de partidos.

### Lógica de Negocio

1. **Reglas del Survivor**: Se implementó la lógica donde un jugador pierde una vida si su equipo elegido no gana (pierde o empata).

2. **Prevención de Picks Duplicados**: El sistema previene que usuarios eliminados o en partidos finalizados realicen nuevas predicciones.

3. **Datos Realistas**: Se poblaron datos con equipos reales de Premier League, La Liga y Champions League para mayor realismo.

### Docker y Persistencia

1. **Containerización de BD**: Se utilizó Docker para MongoDB facilitando el setup y evitando conflictos de instalación.

2. **Persistencia de Datos**: Los datos se persisten en un volumen de Docker, manteniendo la información entre reinicios.

## Consideraciones de Producción

Para un ambiente de producción se recomienda:

1. Implementar autenticación y autorización robusta
2. Agregar validaciones más estrictas en el backend
3. Implementar rate limiting
4. Usar variables de entorno para todas las configuraciones sensibles
5. Implementar logging estructurado
6. Agregar tests unitarios e integración
7. Implementar CI/CD pipeline

## Troubleshooting

### Problemas Comunes

1. **Error de conexión a MongoDB**: Verificar que Docker Desktop esté ejecutándose y el contenedor de MongoDB esté activo.

2. **Puerto en uso**: Si el puerto 4000 está ocupado, cambiar en `.env` y en la configuración de Flutter.

3. **Vidas no se actualizan**: Ejecutar `npm run simulate` después de hacer predicciones y usar el botón refresh en la app.

### Logs Útiles

El servidor mostra logs de las consultas realizadas. Para debug adicional, verificar:
- Estado del contenedor: `docker ps`
- Logs de MongoDB: `docker logs survivor_mongo`
- Reiniciar servicios: `docker-compose restart`
