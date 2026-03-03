import { createServer } from './infra/http/server';
import { env } from './infra/config/env';

const app = createServer();

app.listen(env.PORT, () => {
  console.log(`🚀 Server rodando em http://localhost:${env.PORT}`);
  console.log(`📋 Health check: http://localhost:${env.PORT}/api/health`);
});
