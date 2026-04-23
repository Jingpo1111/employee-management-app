import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

app.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});