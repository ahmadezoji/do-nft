import { AutoPromoterRepository } from "../modules/auto-promoter/auto-promoter.repository.js";
import { AutoPromoterService } from "../modules/auto-promoter/auto-promoter.service.js";

const TICK_INTERVAL_MS = 5 * 60 * 1000;

export const startAutoPromoterScheduler = () => {
  const repository = new AutoPromoterRepository();
  const service = new AutoPromoterService();

  const tick = async () => {
    const dueSettings = await repository.listEnabledUsersDueForRun();

    for (const settings of dueSettings) {
      try {
        await service.runForUser(settings.userId);
      } catch (error) {
        console.error(`Auto-promoter run failed for user ${settings.userId}:`, error);
      }
    }
  };

  setInterval(() => {
    void tick();
  }, TICK_INTERVAL_MS);
};
