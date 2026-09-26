import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import expressAsyncErrors from 'express-async-errors';

dotenv.config();

const app = express();

// Middleware de seguridad
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', (await import('./src/routes/auth.routes.js')).default);
app.use('/api/products', (await import('./src/routes/products.routes.js')).default);
app.use('/api/cart', (await import('./src/routes/cart.routes.js')).default);
app.use('/api/orders', (await import('./src/routes/orders.
