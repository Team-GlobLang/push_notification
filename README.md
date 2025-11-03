# push_notifications

Descripción
-----------
`push_notifications` gestiona el envío de notificaciones push usando Firebase Cloud Messaging (FCM). Mantiene registro de tokens de dispositivo y maneja la lógica de envío.

Variables de entorno (desde `.env.templates`)
-------------------------------------------------
```bash
# ============================
# GLOBAL / BASE CONFIG
# ============================
NODE_ENV=production
NATS_SERVERS=nats://nats-server:4222

# No hay sección específica en .env.templates para push_notifications,
# pero requiere las siguientes variables:
```

Variables adicionales requeridas en `push_notifications/.env`:
```env
# Prisma requiere DATABASE_URL para conectarse a la base de datos
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/push_notifications"
# En Docker será: DATABASE_URL="postgresql://postgres:postgres@db-push:5432/push_notifications"

# Configuración de Firebase
# Ruta al archivo JSON de credenciales generado desde Firebase Console
# (Project Settings > Service accounts > Generate new private key)
FIREBASE_CREDENTIALS_PATH="./config/firebase-adminsdk.json"
# En Docker será: FIREBASE_CREDENTIALS_PATH="/app/config/firebase-adminsdk.json"

# ID del proyecto de Firebase (se encuentra en la configuración del proyecto)
FCM_PROJECT_ID="tu-proyecto-firebase"
```

Instalación y pasos para desarrollo local
----------------------------------------
1. Configura las variables de entorno:

```powershell
copy ..\.env.templates .env
# Edita push_notifications\.env y añade las variables necesarias
```

2. Configura Firebase:
   - Ve a Firebase Console > Project Settings > Service Accounts
   - Haz clic en "Generate New Private Key"
   - Guarda el archivo JSON descargado como `config/firebase-adminsdk.json`
   - En desarrollo: usa la ruta relativa al archivo JSON
   - En Docker: el archivo se montará automáticamente en `/app/config/`

3. Instala dependencias y genera el cliente Prisma:

```powershell
cd push_notifications
npm ci
npx prisma generate
```

4. Ejecuta migraciones de desarrollo:

```powershell
npx prisma migrate dev --name init
```

5. Comandos disponibles:

```powershell
# Compilar el proyecto
npm run build

# Ejecutar en producción
npm run start

# Desarrollo con hot-reload
npm run start:dev
```

Construir imagen Docker
-----------------------
```powershell
docker build -t globalang/push-notifications:latest .
```

Ejecución recomendada en conjunto
--------------------------------
```powershell
# Desde la raíz del proyecto
docker-compose up -d --build
```

Notas importantes
----------------
- El archivo de credenciales de Firebase NO debe subirse al repositorio.
- Las credenciales de Firebase se montan en el contenedor vía Docker Compose.
- Revisa la configuración de Firebase en la consola de Firebase para:
  - Permisos y roles del service account
  - Configuración de FCM
  - Cuotas y límites de mensajes
- En producción usa `npx prisma migrate deploy` en el pipeline.

Archivos relevantes
------------------
- Schema Prisma: `prisma/schema.prisma`
- Cliente generado: `generated/prisma`
- Credenciales Firebase: `config/globalang-push-noty-firebase-adminsdk-fbsvc-d907fad7cc.json`
