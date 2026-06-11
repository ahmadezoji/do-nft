import { AppError } from "../../../common/errors/app-error.js";

import type { ImageGenerationInput, ImageGenerationProvider, ImageGenerationResult } from "../ai.types.js";

type OpenAiImageApiResponse = {
  data?: Array<{
    b64_json?: string;
  }>;
  error?: {
    message?: string;
  };
};

const OPENAI_IMAGE_API_URL = "https://api.openai.com/v1/images/generations";
const DEFAULT_OPENAI_IMAGE_MODEL = "gpt-image-2";
const MIN_EDGE = 256;
const MAX_EDGE = 3840;
const MIN_PIXELS = 655_360;
const MAX_PIXELS = 8_294_400;
const SUPPORTED_OPENAI_IMAGE_MODELS = new Set([
  "gpt-image-2",
  "gpt-image-1.5",
  "gpt-image-1",
  "gpt-image-1-mini",
  "chatgpt-image-latest"
]);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const roundToStep = (value: number, step: number) => Math.max(step, Math.round(value / step) * step);

const normalizeDimension = (value: number | null | undefined, fallback: number) =>
  roundToStep(clamp(value ?? fallback, MIN_EDGE, MAX_EDGE), 16);

const normalizeAspectRatio = (width: number, height: number) => {
  if (width / height > 3) {
    return {
      width,
      height: roundToStep(width / 3, 16)
    };
  }

  if (height / width > 3) {
    return {
      width: roundToStep(height / 3, 16),
      height
    };
  }

  return { width, height };
};

const normalizePixelCount = (width: number, height: number) => {
  const pixels = width * height;

  if (pixels < MIN_PIXELS) {
    const scale = Math.sqrt(MIN_PIXELS / pixels);

    return {
      width: normalizeDimension(width * scale, width),
      height: normalizeDimension(height * scale, height)
    };
  }

  if (pixels > MAX_PIXELS) {
    const scale = Math.sqrt(MAX_PIXELS / pixels);

    return {
      width: normalizeDimension(width * scale, width),
      height: normalizeDimension(height * scale, height)
    };
  }

  return { width, height };
};

const normalizeSize = (width?: number | null, height?: number | null) => {
  const normalizedWidth = normalizeDimension(width, 1024);
  const normalizedHeight = normalizeDimension(height, 1024);
  const aspectRatioSafe = normalizeAspectRatio(normalizedWidth, normalizedHeight);
  const pixelSafe = normalizePixelCount(aspectRatioSafe.width, aspectRatioSafe.height);

  return `${pixelSafe.width}x${pixelSafe.height}`;
};

const buildPrompt = (input: ImageGenerationInput) =>
  [
    input.prompt.trim(),
    input.style ? `Visual style emphasis: ${input.style}.` : null,
    input.referenceImageUrl
      ? `Reference image URL for inspiration only: ${input.referenceImageUrl}. Match the mood or composition cues without copying it directly.`
      : null
  ]
    .filter(Boolean)
    .join("\n\n");

const normalizeModel = (model?: string | null) =>
  model && SUPPORTED_OPENAI_IMAGE_MODELS.has(model) ? model : DEFAULT_OPENAI_IMAGE_MODEL;

export class OpenAiImageProvider implements ImageGenerationProvider {
  readonly name = "openai";

  constructor(private readonly apiKey: string) {}

  async generateImage(input: ImageGenerationInput): Promise<ImageGenerationResult> {
    const model = normalizeModel(input.model);
    const size = normalizeSize(input.outputWidth, input.outputHeight);
    const prompt = buildPrompt(input);

    const response = await fetch(OPENAI_IMAGE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        prompt,
        size,
        quality: "high"
      })
    });

    const payload = (await response.json().catch(() => null)) as OpenAiImageApiResponse | null;

    if (!response.ok) {
      throw new AppError(
        payload?.error?.message ?? "OpenAI image generation failed. Check your API key, model access, or request size.",
        response.status >= 400 && response.status < 500 ? response.status : 502
      );
    }

    const base64Image = payload?.data?.[0]?.b64_json;

    if (!base64Image) {
      throw new AppError("OpenAI did not return an image payload.", 502);
    }

    return {
      model,
      imageUrl: `data:image/png;base64,${base64Image}`
    };
  }
}
