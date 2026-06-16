import express from 'express';

import { salesRouter } from "./src/routes/salesRouter.js";
import { productsRouter } from "./src/routes/productRouter.js";
import { stocksRouter } from "./src/routes/stockRouter.js"; 
import { purchasesRouter } from "./src/routes/purchasesRouter.js";
import { suppliersRouter } from "./src/routes/suppliersRouter.js";
import { errHandler } from "./src/errors/error.js";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/sales", salesRouter);
app.use("/products", productsRouter);
app.use("/stock", stocksRouter);
app.use("/purchases", purchasesRouter );
app.use("/suppliers", suppliersRouter);


app.use(errHandler);

//for local development
const PORT = process.env.PORT || 3000


app.listen(PORT , () => {
    console.log(`Server running on port ${PORT}`);
} )