// config/app.ts
import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './cors';
import routes from '../routes/routes';

const app: Application = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Main routes
app.use('/api', routes); // We'll group all routes inside a single router

export default app;
