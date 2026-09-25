# ⚽ Mi Tienda de Cleats

Tienda online de zapatillas y botines de fútbol. Proyecto en construcción.

## Tecnologías

**Frontend**
- React 19 + Vite
- Tailwind CSS v4
- React Router DOM
- Zustand (estado global)
- React Hook Form + Zod (formularios)
- Supabase (base de datos y auth)
- Axios

**Backend**
- Node.js + Express
- Supabase
- JWT (autenticación)
- Stripe (pagos)
- Helmet, CORS, Morgan

## Estructura del proyecto

```
mi-tienda-bonita/
├── frontend/          # App React + Vite
│   └── src/
│       ├── components/    # Componentes reutilizables
│       ├── pages/         # Páginas (Home, Productos, Carrito...)
│       └── assets/        # Imágenes, estilos
├── backend/           # API REST con Express
├── .env               # Variables de entorno (no se sube a GitHub)
├── docker-compose.yml
└── dockerfile
```

## Instalación local

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Abre http://localhost:3000

### Backend
```bash
cd backend
npm install
npm run dev
```
Corre en http://localhost:5000

## Variables de entorno

Crea un archivo `.env` en la raíz con:

```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_KEY=tu_clave_de_supabase
STRIPE_SECRET_KEY=tu_clave_de_stripe
JWT_SECRET=tu_secreto_jwt
```

## Estado del proyecto

🚧 En construcción — se irán agregando funcionalidades progresivamente.

- [x] Estructura base del proyecto
- [x] Navegación y rutas
- [x] Diseño con Tailwind CSS
- [ ] Catálogo de productos conectado al backend
- [ ] Carrito de compras funcional
- [ ] Checkout con Stripe
- [ ] Autenticación de usuarios
- [ ] Panel de administración
