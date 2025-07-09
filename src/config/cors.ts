import cors from 'cors';

export const corsOptions: cors.CorsOptions = {
  origin: ['http://localhost:3000', 'https://your-production-site.com'],
  credentials: true,
};
