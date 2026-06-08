export const defaultTemplates = [
  {
    title: "Cyber Relic Portrait",
    category: "Portrait",
    style: "Cyberpunk",
    structure: "Subject + relic + atmospheric light",
    promptText:
      "Heroic portrait of a futuristic relic keeper, layered textures, cinematic rim light, collectible NFT framing",
    negativePrompt: "blurry, distorted anatomy, watermark",
    recommendedModel: "openai-image",
    aspectRatio: "1:1"
  },
  {
    title: "Mythic Creature Emblem",
    category: "Creature",
    style: "Fantasy",
    structure: "Creature + symbol + minimal background",
    promptText:
      "Mythic beast designed as a premium collectible emblem, bold silhouette, luxurious detail, high contrast",
    negativePrompt: "low contrast, messy composition, duplicate limbs",
    recommendedModel: "gemini-image",
    aspectRatio: "1:1"
  },
  {
    title: "Abstract Signal Artifact",
    category: "Abstract",
    style: "Experimental",
    structure: "Shape language + texture + glitch motion feel",
    promptText:
      "Abstract digital artifact with signal distortion, layered geometry, gallery-quality composition, strong rarity identity",
    negativePrompt: "muddy colors, visual noise, text overlays",
    recommendedModel: "openai-image",
    aspectRatio: "1:1"
  }
];
