import React, { useState } from 'react';
import { Download, RefreshCw, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { GeneratedImage } from '../types';

interface GalleryProps {
  images: GeneratedImage[];
  isGenerating: boolean;
  onRecreate: (originalImage: GeneratedImage, prompt: string) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ images, isGenerating, onRecreate }) => {
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);
  const [recreatePrompt, setRecreatePrompt] = useState("");
  const [recreateId, setRecreateId] = useState<string | null>(null);

  const openLightbox = (index: number) => setLightboxImageIndex(index);
  const closeLightbox = () => setLightboxImageIndex(null);
  
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxImageIndex !== null && lightboxImageIndex < images.length - 1) {
      setLightboxImageIndex(lightboxImageIndex + 1);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxImageIndex !== null && lightboxImageIndex > 0) {
      setLightboxImageIndex(lightboxImageIndex - 1);
    }
  };

  const handleRecreateSubmit = (image: GeneratedImage) => {
    if (!recreatePrompt.trim()) return;
    onRecreate(image, recreatePrompt);
    setRecreateId(null);
    setRecreatePrompt("");
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-6 overflow-y-auto h-full relative transition-colors duration-300">
      
      {/* Empty State */}
      {images.length === 0 && !isGenerating && (
        <div className="h-full flex flex-col items-center justify-center text-gray-400">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
             <RefreshCw className="w-10 h-10 opacity-20" />
          </div>
          <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">Sẵn sàng sáng tạo</h3>
          <p className="text-sm mt-2">Nhập thông tin thiết kế ở cột bên trái để bắt đầu.</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        {images.map((img, index) => (
          <div key={img.id} className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Header / Style Tag */}
            <div className="absolute top-3 left-3 z-10">
              <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-medium rounded-full border border-white/10">
                {img.styleName}
              </span>
            </div>

            {/* Image Container */}
            <div 
              className="cursor-zoom-in aspect-auto overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
              onClick={() => openLightbox(index)}
            >
               <img 
                 src={img.url} 
                 alt="Generated design" 
                 className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
               />
            </div>

            {/* Actions Bar (visible on hover) */}
            <div className="p-4 flex items-center justify-between bg-white dark:bg-gray-900">
               <div className="text-xs text-gray-400 font-mono truncate max-w-[120px]">
                 {new Date(img.timestamp).toLocaleTimeString('vi-VN')}
               </div>
               
               <div className="flex items-center gap-2">
                 {/* Recreate Button with Popover */}
                 <div className="relative">
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       setRecreateId(recreateId === img.id ? null : img.id);
                     }}
                     className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 transition-colors"
                     title="Tạo lại / Chỉnh sửa"
                   >
                     <RefreshCw className="w-4 h-4" />
                   </button>
                   
                   {/* Recreate Popover */}
                   {recreateId === img.id && (
                     <div 
                        className="absolute bottom-full right-0 mb-2 w-72 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-20"
                        onClick={(e) => e.stopPropagation()}
                     >
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                          Chỉ dẫn chỉnh sửa
                        </label>
                        <input
                          autoFocus
                          type="text"
                          value={recreatePrompt}
                          onChange={(e) => setRecreatePrompt(e.target.value)}
                          placeholder="Ví dụ: Đổi màu nền sang xanh dương"
                          className="w-full p-2 text-xs border rounded mb-2 bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100 placeholder-gray-400"
                          onKeyDown={(e) => e.key === 'Enter' && handleRecreateSubmit(img)}
                        />
                        <button
                          onClick={() => handleRecreateSubmit(img)}
                          className="w-full bg-primary-600 text-white text-xs py-2 rounded-lg hover:bg-primary-700 font-medium"
                        >
                          Tạo biến thể
                        </button>
                     </div>
                   )}
                 </div>

                 <a 
                   href={img.url} 
                   download={`design-${img.id}.png`}
                   onClick={(e) => e.stopPropagation()}
                   className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 transition-colors"
                   title="Tải xuống"
                 >
                   <Download className="w-4 h-4" />
                 </a>
               </div>
            </div>
          </div>
        ))}
        
        {/* Loading Skeleton for pending generations */}
        {isGenerating && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
            <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-gray-400 animate-bounce" />
            </div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImageIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <button 
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <button 
            onClick={prevImage}
            disabled={lightboxImageIndex === 0}
            className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <img 
            src={images[lightboxImageIndex].url} 
            alt="Full view" 
            className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-sm"
          />

          <button 
            onClick={nextImage}
            disabled={lightboxImageIndex === images.length - 1}
            className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          
          <div className="absolute bottom-6 bg-black/50 px-4 py-2 rounded-full text-white text-sm font-medium backdrop-blur-md border border-white/10">
            {images[lightboxImageIndex].styleName} • {images[lightboxImageIndex].aspectRatio}
          </div>
        </div>
      )}
    </div>
  );
};