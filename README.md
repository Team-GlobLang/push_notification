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

# Configuración de Firebase (valores del JSON de credenciales)
# Para obtener estos valores, descarga el JSON de Firebase Console:
# Project Settings > Service Accounts > Generate New Private Key
FIREBASE_PROJECT_ID="tu-proyecto-firebase"
FIREBASE_PRIVATE_KEY_ID="abc123..."
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com"
FIREBASE_CLIENT_ID="123456789..."
FIREBASE_CLIENT_CERT_URL="https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40tu-proyecto.iam.gserviceaccount.com"
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
   - Abre el archivo JSON descargado y copia cada valor a tu archivo `.env`:
     - `project_id` → `FIREBASE_PROJECT_ID`
     - `private_key_id` → `FIREBASE_PRIVATE_KEY_ID`
     - `private_key` → `FIREBASE_PRIVATE_KEY` (mantén los \n en el string)
     - `client_email` → `FIREBASE_CLIENT_EMAIL`
     - `client_id` → `FIREBASE_CLIENT_ID`
     - `client_x509_cert_url` → `FIREBASE_CLIENT_CERT_URL`
   - IMPORTANTE: No subas el archivo JSON al repositorio

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
- Las credenciales de Firebase ahora se gestionan mediante variables de entorno
- La private key de Firebase debe mantener los saltos de línea (\n)
- NO subas archivos JSON de credenciales al repositorio
- Revisa la configuración de Firebase en la consola de Firebase para:
  - Permisos y roles del service account
  - Configuración de FCM
  - Cuotas y límites de mensajes
- En producción usa `npx prisma migrate deploy` en el pipeline

Archivos relevantes
------------------
- Schema Prisma: `prisma/schema.prisma`
- Cliente generado: `generated/prisma`
- Servicio: `src/push-notifications/push-notifications.service.ts`
