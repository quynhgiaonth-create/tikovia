import { AspectRatio } from './types';

export const DEFAULT_INPUTS = {
  aspectRatio: AspectRatio.Square,
  description: "",
  referenceImages: [],
  productImages: [],
  productInstructions: "",
  mainHeading: "",
  headingStyle: "Hiện đại không chân (Modern Sans-Serif)",
  subHeading: "",
  variationCount: 1,
};

// Styles for the AI to iterate through if generating multiple variations
export const DESIGN_STYLES = [
  "Hiện đại tối giản (Modern Minimalist)",
  "Đậm nét & Sôi động (Bold & Vibrant)",
  "Sang trọng & Thanh lịch (Luxury & Elegant)",
  "Thô mộc mới (Neo-Brutalism)",
  "Doanh nghiệp chuyên nghiệp (Corporate Professional)",
  "Trừu tượng nghệ thuật (Abstract Artistic)",
  "Công nghệ & Tương lai (Tech & Futuristic)"
];