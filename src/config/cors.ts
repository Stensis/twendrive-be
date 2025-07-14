import cors from 'cors';

export const corsOptions: cors.CorsOptions = {
  origin: ['http://localhost:8080', 'https://your-production-site.com'],
  credentials: true,
};
