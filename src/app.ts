import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import bankRoutes from './routes/bankRoutes';
import transactionRoutes from './routes/transactionRoutes';
import { errorHandlerMiddleware } from './middlewares/errorHandlerMiddleware';
import { authMiddleware } from './middlewares/authMiddleware';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(authMiddleware);
app.use('/api/banks', bankRoutes);
app.use('/api/banks/:bankId/transactions', transactionRoutes);
app.use(errorHandlerMiddleware);

export default app;
