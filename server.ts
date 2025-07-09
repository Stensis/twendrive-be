// server.ts
import app from './src/config/app';
import { env } from './src/config/env';

app.listen(env.PORT, () => {
  console.log(`🚀 Server running at http://localhost:${env.PORT}`);
});
