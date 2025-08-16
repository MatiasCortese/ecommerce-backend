# 🛍️ E-Commerce Backend

Backend API para plataforma de e-commerce construido con **Next.js**, **Firebase**, y **MercadoPago**. Proporciona endpoints para gestión de órdenes, procesamiento de pagos y notificaciones de webhook.

## 🚀 Características

- ✅ **Gestión de Órdenes**: Creación y consulta de órdenes de compra
- ✅ **Integración con MercadoPago**: Generación de links de pago y procesamiento de transacciones
- ✅ **Base de Datos Firebase**: Almacenamiento de órdenes y datos de usuario
- ✅ **Webhooks**: Manejo de notificaciones de pago de MercadoPago
- ✅ **Autenticación JWT**: Middleware de autenticación para endpoints protegidos
- ✅ **Notificaciones por Email**: Sistema de envío de emails con Nodemailer
- ✅ **Desplegado en Vercel**: Listo para producción

## 🛠️ Stack Tecnológico

- **Framework**: Next.js (API Routes)
- **Base de Datos**: Firebase Firestore
- **Pagos**: MercadoPago SDK
- **Autenticación**: JSON Web Tokens (JWT)
- **Email**: Nodemailer
- **Deployment**: Vercel
- **Lenguaje**: TypeScript

## 📋 Prerrequisitos

- Node.js 18.x o superior
- Cuenta de Firebase
- Cuenta de MercadoPago (con credenciales de API)
- Cuenta de Vercel (para deployment)

## ⚙️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/MatiasCortese/ecommerce-backend.git
   cd ecommerce-backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configurar variables de entorno**
   
   Crear archivo `.env.local`:
   ```env
   # Firebase
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
   # O usar variables separadas:
   FIREBASE_PROJECT_ID=tu-project-id
   FIREBASE_CLIENT_EMAIL=firebase-admin@tu-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

   # MercadoPago
   MP_ACCESS_TOKEN=tu-access-token-de-mercadopago

   # JWT
   JWT_SECRET=tu-jwt-secret

   # Nodemailer (opcional)
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASS=tu-app-password
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

   La API estará disponible en `http://localhost:3000`

## 📚 API Endpoints

### 🔐 Autenticación (`/api/auth`)

#### POST `/api/auth`
Login de usuario y generación de JWT token.

#### POST `/api/auth/token`
Validación y renovación de tokens JWT.

### 👤 Usuario (`/api/me`)

#### GET `/api/me/address`
Obtener direcciones del usuario autenticado.

#### POST `/api/me/address`
Crear nueva dirección para el usuario.

#### PUT `/api/me/address`
Actualizar dirección existente.

#### GET `/api/me/orders`
Obtener historial de órdenes del usuario.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Respuesta:**
```json
{
  "orders": [
    {
      "id": "order-id",
      "status": "approved",
      "createdAt": "2025-08-16T...",
      "items": [...]
    }
  ]
}
```

### 🛍️ Productos (`/api/products`)

#### GET `/api/products/[productId]`
Obtener información detallada de un producto específico.

**Respuesta:**
```json
{
  "id": "product-id",
  "title": "iPhone 15 Pro Max",
  "price": 1250,
  "description": "...",
  "images": ["url1", "url2"],
  "category": "telefonia",
  "stock": 10
}
```

### 🔍 Búsqueda (`/api/search`)

#### GET `/api/search/index?q=<query>&category=<category>`
Buscar productos por término y/o categoría.

**Parámetros:**
- `q`: Término de búsqueda
- `category`: Categoría del producto
- `limit`: Límite de resultados (opcional)
- `offset`: Offset para paginación (opcional)

**Respuesta:**
```json
{
  "results": [
    {
      "id": "product-id",
      "title": "Producto encontrado",
      "price": 999,
      "image": "url"
    }
  ],
  "total": 25,
  "hasMore": true
}
```

### 📦 Órdenes (`/api/order`)

#### POST `/api/order`
Crear nueva orden y generar link de pago.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Body:**
```json
{
  "itemId": "telefonia-celular",
  "itemTitle": "iPhone 15 Pro Max",
  "quantity": 1,
  "unitPrice": 1250,
  "productId": "IPHONE15PM",
  "external_reference": "ORDER_001"
}
```

**Respuesta:**
```json
{
  "linkDePago": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...",
  "orderId": "generated-order-id"
}
```

#### GET `/api/order/[orderId]`
Obtener información detallada de una orden específica.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Respuesta:**
```json
{
  "id": "order-id",
  "userId": "user-id",
  "status": "approved",
  "items": [...],
  "total": 1250,
  "paymentIdMp": "mp-payment-id",
  "createdAt": "2025-08-16T...",
  "updatedAt": "2025-08-16T..."
}
```

### 🔔 Webhooks (`/api/ipn/mercadopago`)

#### POST `/api/ipn/mercadopago`
Webhook para recibir notificaciones de estado de pago de MercadoPago.

**Body (automático desde MercadoPago):**
```json
{
  "action": "payment.created",
  "api_version": "v1",
  "data": {
    "id": "122069233829"
  },
  "date_created": "2025-08-16T19:26:09Z",
  "id": 123890530560,
  "live_mode": true,
  "type": "payment",
  "user_id": "2044165620"
}
```

## 🗃️ Estructura de Base de Datos

### Colección `orders`
```javascript
{
  userId: string,           // ID del usuario
  productId: string,        // ID del producto
  itemId: string,          // ID del item
  itemTitle: string,       // Título del producto
  quantity: number,        // Cantidad
  unitPrice: number,       // Precio unitario
  status: string,          // "pending" | "approved" | "rejected"
  external_reference: string, // Referencia externa
  paymentIdMp?: string,    // ID de pago de MercadoPago
  payerEmail?: string,     // Email del pagador
  createdAt: Date,         // Fecha de creación
  updatedAt?: Date         // Fecha de actualización
}
```

## 🚀 Deployment en Vercel

1. **Conectar repositorio** a Vercel
2. **Configurar variables de entorno** en el dashboard de Vercel
3. **Deploy automático** desde la rama `main`

### Variables de Entorno en Vercel:

- `FIREBASE_SERVICE_ACCOUNT` o variables separadas de Firebase
- `MP_ACCESS_TOKEN`
- `JWT_SECRET`
- Variables de Nodemailer (si aplica)

## 🔧 Desarrollo

### Estructura del Proyecto
```
├── pages/
│   └── api/
│       ├── order.ts          # Gestión de órdenes
│       └── ipn/
│           └── mercadopago.ts # Webhook de MercadoPago
├── lib/
│   ├── firestore.ts          # Configuración de Firebase
│   ├── mercadopago.ts        # Configuración de MercadoPago
│   ├── middlewares.ts        # Middleware de autenticación
│   └── nodemailer.ts         # Configuración de email
└── README.md
```

### Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build para producción
npm run start        # Ejecutar build
npm run lint         # Linting
```

## 🧪 Testing

### Probar endpoints localmente:

```bash
# Crear orden
curl -X POST http://localhost:3000/api/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu-jwt-token>" \
  -d '{
    "itemId": "test-item",
    "itemTitle": "Producto Test",
    "quantity": 1,
    "unitPrice": 100,
    "productId": "TEST001",
    "external_reference": "TEST_ORDER_001"
  }'

# Consultar orden
curl -X GET "http://localhost:3000/api/order?orderId=test-id" \
  -H "Authorization: Bearer <tu-jwt-token>"
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Notas Importantes

- **Seguridad**: Nunca commitear credenciales reales en el código
- **Firebase**: Usar variables de entorno separadas es más seguro que el JSON completo
- **MercadoPago**: Configurar webhooks en el dashboard de MercadoPago apuntando a `/api/ipn/mercadopago`
- **JWT**: El token debe incluir `userId` en el payload

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 📞 Contacto

**Matías Cortese** - [GitHub](https://github.com/MatiasCortese)

**URL del Proyecto**: [https://github.com/MatiasCortese/ecommerce-backend](https://github.com/MatiasCortese/ecommerce-backend)

---

⭐ **¡Dale una estrella si te gustó el proyecto!**
