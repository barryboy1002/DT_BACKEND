import express from 'express';
import helmet from 'helmet';
import logger from './src/utils/logger.js';

import { salesRouter } from "./src/routes/salesRouter.js";
import { productsRouter } from "./src/routes/productRouter.js";
import { stocksRouter } from "./src/routes/stockRouter.js"; 
import { purchasesRouter } from "./src/routes/purchasesRouter.js";
import { suppliersRouter } from "./src/routes/suppliersRouter.js";
import { categoriesRouter } from "./src/routes/categoriesRouter.js";
import { reportsRouter } from "./src/routes/reportsRouter.js";
import { authRouter } from './src/routes/authRouter.js';
import { errorHandler } from "./src/middleware/errHandler.js";
import { authorize } from './src/middleware/authorize.js';
import {dashboardRouter } from "./src/routes/dashboardRouter.js";
import { rateLimiter } from './src/middleware/rateLimiter.js';




const app = express();

// Security headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable for API
    crossOriginEmbedderPolicy: false
}));

// HTTP request logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.path}`, {
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip
        });
    });
    next();
});

// Rate limiting for all routes - increased limits
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 500 }));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL ? 
    process.env.FRONTEND_URL.split(',') : 
    ['http://localhost:5173'];


app.use("/auth", authRouter);
app.use("/dashboard",  dashboardRouter);
app.use("/sales", salesRouter);
app.use("/products", productsRouter);
app.use("/stock", stocksRouter);
app.use("/purchases", purchasesRouter );
app.use("/suppliers", suppliersRouter);
app.use("/categories", categoriesRouter);
   

// purchases endpoints
app.use("/purchases", purchasesRouter);

// reports
app.use('/reports', reportsRouter);


app.use(errorHandler);

//for local development
const PORT = process.env.PORT || 3000


if (process.env.NODE_ENV !== 'test'){
    app.listen(PORT , () => {
        logger.info(`Server running on port ${PORT}`, { 
            environment: process.env.NODE_ENV || 'development' 
        });
    } )
}

export default app;
