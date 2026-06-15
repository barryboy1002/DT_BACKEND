import express from express;

import { salesRouter } from "./src/routes/salesRouter";
import { productsRouter } from "./src/routes/productRouter";
import { stocksRouter } from "./src/routes/stockRouter"; 
import { purchasesRouter } from "./src/routes/purchasesRouter";
import { suppliersRouter } from "./src/routes/suppliersRouter";

const app = express();


app.use("/sales", salesRouter);
app.use("/products", productsRouter);
app.use("/stock", stocksRouter);
app.use("/purchases", purchasesRouter );
app.use("/suppliers", suppliersRouter);