
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { DesignInputs, AspectRatio } from "../types";

// Special Prompt for Facebook Covers
const FACEBOOK_COVER_PROMPT = `
STRICT OUTPUT REQUIREMENT: FACEBOOK COVER DESIGN.

TECHNICAL INSTRUCTION: 
The generation canvas is fixed at 16:9. You MUST generate the design to fit the requested layout CENTERED within this 16:9 frame.
1. Active Design Area: Equivalent to 2048x779 pixels (approx 2.6:1 ratio).
2. Background Extension: Fill the remaining vertical space of the 16:9 canvas with extended background/gradient so it can be cropped without white bars.

DESIGN PROMPT:
Design a Facebook cover photo that fits both desktop (2048 x 779 px) and mobile devices.
The design should be clean and visually appealing with the key elements (Text, Logo, Face, Product) strictly centered within the safe zone of 1325 x 779 pixels. 
Anything outside this center 1325px width may be cropped on mobile.
Include a vibrant background with a professional, modern look. Make sure the text is legible and clear, with the name of the fan page or key message prominently displayed in the center. The logo should be positioned subtly, either at the top or bottom, without interfering with the main content. Ensure the image looks balanced and cohesive on both desktop and mobile platforms.
`;

// Models
const PRO_MODEL = 'gemini-3-pro-image-preview';
const FLASH_MODEL = 'gemini-2.5-flash-image';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to check for overload/internal/permission errors
const parseErrorInfo = (error: any) => {
  let message = error.message || "";
  let code = error.status || error.code || 0;
  let status = "";

  try {
    const jsonMatch = message.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.error) {
        message = parsed.error.message || message;
        code = parsed.error.code || code;
        status = parsed.error.status || status;
      }
    }
  } catch (e) { }

  const isOverloaded =
    code === 503 || code === 500 || code === 429 ||
    status === 'UNAVAILABLE' || status === 'INTERNAL' || status === 'RESOURCE_EXHAUSTED' ||
    message.includes('503') || message.includes('500') || message.toLowerCase().includes('overloaded');

  const isPermission =
    code === 403 || status === 'PERMISSION_DENIED' || message.includes('403') ||
    message.includes('PERMISSION_DENIED') || message.includes('Requested entity was not found');

  return { message, code, status, isOverloaded, isPermission };
};

export const generateDesign = async (
  inputs: DesignInputs,
  styleName: string,
  retryCount: number = 0,
  useFlashModel: boolean = false
): Promise<string> => {
  try {
    // Luôn khởi tạo instance mới ngay trước khi gọi để lấy key mới nhất
    // Get Key from LocalStorage
    const apiKey = localStorage.getItem('GEMINI_API_KEY') || '';

    if (!apiKey) {
      window.dispatchEvent(new Event('OPEN_API_KEY_MODAL'));
      throw new Error("Vui lòng nhập API Key để tiếp tục.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const parts: any[] = [];

    // 1. Add Reference Images
    if (inputs.referenceImages && inputs.referenceImages.length > 0) {
      inputs.referenceImages.forEach((img) => {
        const base64Data = img.data.split(',')[1] || img.data;
        parts.push({ inlineData: { mimeType: img.mimeType, data: base64Data } });
      });
      parts.push({ text: "IMAGE TYPE: REFERENCE (Use for layout/style inspiration)" });
    }

    // 2. Add Product Images
    if (inputs.productImages && inputs.productImages.length > 0) {
      inputs.productImages.forEach((img) => {
        const base64Data = img.data.split(',')[1] || img.data;
        parts.push({ inlineData: { mimeType: img.mimeType, data: base64Data } });
      });
      parts.push({ text: "IMAGE TYPE: PRODUCT ASSET (Must be featured in design)" });
    }

    let targetAspectRatio = inputs.aspectRatio;
    let extraPromptInstructions = "";
    let imageSize = useFlashModel ? undefined : "1K";

    if (inputs.aspectRatio === AspectRatio.FacebookCover) {
      targetAspectRatio = AspectRatio.Landscape;
      extraPromptInstructions = FACEBOOK_COVER_PROMPT;
      if (!useFlashModel) imageSize = "2K";
    }

    const systemPrompt = `
      STRICT COMMERCIAL DESIGN TASK.
      Design style: ${styleName}. Use ${inputs.headingStyle} typography.
      
      Requirements: ${inputs.description}. 
      Product Notes: ${inputs.productInstructions}.
      
      TEXT OVERLAYS (Render precisely):
      - Headline: "${inputs.mainHeading}"
      - Subheadline: "${inputs.subHeading}"

      ${extraPromptInstructions}
      Final instruction: Output only the generated image.
    `;

    parts.push({ text: systemPrompt });

    const currentModel = useFlashModel ? FLASH_MODEL : PRO_MODEL;
    const maxRetries = 8;

    const response = await ai.models.generateContent({
      model: currentModel,
      contents: { parts },
      config: {
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ],
        imageConfig: {
          aspectRatio: targetAspectRatio as any,
          imageSize: imageSize as any
        }
      }
    });

    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.finishReason === 'SAFETY') throw new Error("Yêu cầu bị chặn do bộ lọc an toàn.");

      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
    }

    throw new Error("Mô hình không trả về hình ảnh.");

  } catch (error: any) {
    const errorInfo = parseErrorInfo(error);
    const attemptsSoFar = retryCount + 1;
    const maxRetries = 8;

    // Xử lý lỗi 403 (Permission)
    // Xử lý lỗi 403 (Permission) hoặc Invalid Key
    if (errorInfo.isPermission && retryCount === 0) {
      console.warn("Lỗi 403: Yêu cầu nhập lại API Key...");
      window.dispatchEvent(new Event('OPEN_API_KEY_MODAL'));
      throw new Error("API Key không hợp lệ hoặc không có quyền truy cập.");
    }

    // Xử lý lỗi 503/500 (Overload)
    if (errorInfo.isOverloaded) {
      if (retryCount < 3) {
        const delay = 4000 * Math.pow(1.6, retryCount) + (Math.random() * 2000);
        console.warn(`Máy chủ quá tải. Thử lại lần ${attemptsSoFar}/${maxRetries} sau ${Math.round(delay)}ms...`);
        await wait(delay);
        return generateDesign(inputs, styleName, retryCount + 1, useFlashModel);
      } else if (!useFlashModel) {
        // Nếu Pro fail quá 3 lần, chuyển sang Flash
        console.warn("Pro model quá tải. Chuyển sang Flash model...");
        await wait(2000);
        return generateDesign(inputs, styleName, 0, true);
      } else if (retryCount < maxRetries) {
        const delay = 5000 * Math.pow(1.5, retryCount - 3) + 1000;
        await wait(delay);
        return generateDesign(inputs, styleName, retryCount + 1, true);
      }
    }

    if (errorInfo.isPermission) throw new Error("Lỗi quyền truy cập (403). Bạn cần sử dụng API Key từ dự án có bật thanh toán (Paid project) để dùng model Pro.");
    if (errorInfo.isOverloaded) throw new Error("Hệ thống Google AI hiện đang quá tải. Vui lòng thử lại sau ít phút.");

    throw error;
  }
};

export const editDesign = async (
  originalImageBase64: string,
  instruction: string,
  aspectRatio: string,
  retryCount: number = 0,
  useFlashModel: boolean = false
): Promise<string> => {
  try {
    const apiKey = localStorage.getItem('GEMINI_API_KEY') || '';
    if (!apiKey) {
      window.dispatchEvent(new Event('OPEN_API_KEY_MODAL'));
      throw new Error("Vui lòng nhập API Key.");
    }
    const ai = new GoogleGenAI({ apiKey });
    const parts: any[] = [];
    const base64Data = originalImageBase64.split(',')[1] || originalImageBase64;

    parts.push({ inlineData: { mimeType: "image/png", data: base64Data } });

    let targetAspectRatio = aspectRatio;
    let extraPrompt = "";
    let imageSize = useFlashModel ? undefined : "1K";

    if (aspectRatio === AspectRatio.FacebookCover) {
      targetAspectRatio = AspectRatio.Landscape;
      extraPrompt = "Maintain Facebook Cover layout. " + FACEBOOK_COVER_PROMPT;
      if (!useFlashModel) imageSize = "2K";
    }

    parts.push({ text: `EDIT IMAGE: ${instruction}. ${extraPrompt} GENERATE EDITED IMAGE NOW.` });

    const currentModel = useFlashModel ? FLASH_MODEL : PRO_MODEL;
    const response = await ai.models.generateContent({
      model: currentModel,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: targetAspectRatio as any,
          imageSize: imageSize as any
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
      return `data:image/png;base64,${response.candidates[0].content.parts[0].inlineData.data}`;
    }
    throw new Error("Không tạo được ảnh chỉnh sửa.");
  } catch (error: any) {
    const errorInfo = parseErrorInfo(error);
    if (errorInfo.isPermission && retryCount === 0) {
      window.dispatchEvent(new Event('OPEN_API_KEY_MODAL'));
      throw new Error("API Key không hợp lệ.");
    }
    if (errorInfo.isOverloaded && retryCount < 5) {
      await wait(4000);
      return editDesign(originalImageBase64, instruction, aspectRatio, retryCount + 1, useFlashModel);
    }
    throw error;
  }
};
