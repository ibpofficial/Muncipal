import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from '../server/src/routes/api';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Municipal Road Operations Command Center Engine',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', apiRouter);

export default app;
