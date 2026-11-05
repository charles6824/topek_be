import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🏗️  TOPEK CONSTRUCTION LIMITED - API ENGINE`);
    console.log(`🔒  Security Mode: OWASP Hardened (Helmet, CORS, JWT, RBAC)`);
    console.log(`🚀  Server running on port: ${PORT}`);
    console.log(`🌐  API URL: http://localhost:${PORT}/api`);
    console.log(`=======================================================`);
  });
}

bootstrap().catch((err) => {
  console.error('[Server Error]', err);
  process.exit(1);
});
