
export interface Project {
  id: string;
  name: string;
  createdAt: number;
  inputs: DesignInputs;
  images: GeneratedImage[];
}

export interface DesignInputs {
  aspectRatio: AspectRatio;
  description: string;
  referenceImages: FileData[]; // New field for Style References
  productImages: FileData[]; // Base64 data
  productInstructions: string;
  mainHeading: string;
  headingStyle: string;
  subHeading: string;
  variationCount: number;
}

export interface FileData {
  id: string;
  data: string; // Base64
  mimeType: string;
  name: string;
}

export interface GeneratedImage {
  id: string;
  url: string; // Data URL or remote URL
  promptUsed: string;
  styleName: string;
  timestamp: number;
  aspectRatio: AspectRatio;
}

export enum AspectRatio {
  Square = "1:1",
  Landscape = "16:9",
  FacebookCover = "16:9_FB",
  Portrait = "9:16",
  Standard = "4:3",
  Vertical = "4:5"
}

export const HEADING_STYLES = [
  "Hiện đại không chân (Modern Sans-Serif)",
  "Thanh lịch có chân (Elegant Serif)",
  "Nổi bật (Bold Display)",
  "Viết tay / Script",
  "Tối giản mỏng (Minimalist Thin)",
  "Công nghệ / Tương lai (Tech)",
  "Cổ điển / Vintage"
];

export const ASPECT_RATIO_LABELS: Record<AspectRatio, string> = {
  [AspectRatio.Square]: "Vuông (1:1) - Instagram/Post",
  [AspectRatio.Landscape]: "Ngang (16:9) - YouTube/Web",
  [AspectRatio.FacebookCover]: "Bìa Facebook (2048x779)",
  [AspectRatio.Portrait]: "Dọc (9:16) - Stories/TikTok",
  [AspectRatio.Standard]: "Tiêu chuẩn (4:3) - Thuyết trình",
  [AspectRatio.Vertical]: "Dọc (4:5) - Feed",
};
