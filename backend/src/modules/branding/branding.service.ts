import { BrandingRepository } from "./branding.repository.js";

export class BrandingService {
  constructor(private readonly brandingRepository = new BrandingRepository()) {}

  async get(userId: string) {
    return (
      (await this.brandingRepository.findByUserId(userId)) ?? {
        brandName: "",
        artistName: "",
        artStyle: "",
        personalityNotes: "",
        targetAudience: "",
        nftThemePreferences: "",
        toneOfVoice: "",
        socialMediaStyle: "",
        defaultHashtags: []
      }
    );
  }

  async upsert(userId: string, input: Record<string, unknown>) {
    return this.brandingRepository.upsert(userId, input);
  }
}
