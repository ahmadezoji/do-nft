import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./database/prisma.js";
import { startAutoPromoterScheduler } from "./jobs/auto-promoter-scheduler.js";

const server = app.listen(env.PORT, () => {
  console.log(`Backend listening on port ${env.PORT}`);
  startAutoPromoterScheduler();
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
