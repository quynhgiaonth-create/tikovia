import React, { useRef } from 'react';
import { Upload, X, Sparkles, Image as ImageIcon } from 'lucide-react';
import { DesignInputs, AspectRatio, HEADING_STYLES, ASPECT_RATIO_LABELS, FileData } from '../types';

interface InputFormProps {
  inputs: DesignInputs;
  onChange: (newInputs: DesignInputs) => void;
  onSubmit: () => void;
  isGenerating: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ inputs, onChange, onSubmit, isGenerating }) => {
  const productInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'productImages' | 'referenceImages') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newFile: FileData = {
            id: Date.now().toString(),
            name: file.name,
            mimeType: file.type,
            data: event.target.result as string,
          };
          onChange({
            ...inputs,
            [field]: [...inputs[field], newFile]
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (id: string, field: 'productImages' | 'referenceImages') => {
    onChange({
      ...inputs,
      [field]: inputs[field].filter(img => img.id !== id)
    });
  };

  const updateField = <K extends keyof DesignInputs>(key: K, value: DesignInputs[K]) => {
    onChange({ ...inputs, [key]: value });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-[420px] shrink-0 transition-colors duration-300">
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Hồ sơ thiết kế</h2>
          <p className="text-gray-500 text-sm">Xác định yêu cầu sáng tạo của bạn.</p>
        </div>

        {/* 1. Size */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Kích thước thiết kế</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(AspectRatio).map((ratio) => (
              <button
                key={ratio}
                onClick={() => updateField('aspectRatio', ratio)}
                className={`
                  p-2 text-xs border rounded-lg transition-all text-left truncate
                  ${inputs.aspectRatio === ratio 
                    ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 ring-1 ring-primary-500' 
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300'
                  }
                `}
                title={ASPECT_RATIO_LABELS[ratio]}
              >
                {ASPECT_RATIO_LABELS[ratio]}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Reference Image (New Section) */}
        <div className="space-y-3">
           <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex justify-between">
            <span>Ảnh mẫu tham khảo (Style Ref)</span>
            <span className="text-xs font-normal text-gray-400">{inputs.referenceImages.length} ảnh</span>
          </label>
           <p className="text-xs text-gray-500">Tải lên thiết kế mẫu để AI học hỏi bố cục và phong cách.</p>
           
           <div className="flex gap-2 overflow-x-auto pb-2">
            {inputs.referenceImages.map((img) => (
              <div key={img.id} className="relative group w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img src={img.data} alt="reference" className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeImage(img.id, 'referenceImages')}
                  className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => referenceInputRef.current?.click()}
              className="w-20 h-20 shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-gray-500"
            >
              <ImageIcon className="w-5 h-5 mb-1" />
              <span className="text-[9px]">Thêm mẫu</span>
            </button>
          </div>
          <input 
            type="file" 
            ref={referenceInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => handleFileChange(e, 'referenceImages')} 
          />
        </div>

        {/* 3. Description */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ý tưởng & Không khí</label>
          <textarea
            value={inputs.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Ví dụ: Phong cách mùa hè tối giản với màu pastel nhẹ nhàng..."
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none text-sm min-h-[80px]"
          />
        </div>

        {/* 4. Product Assets */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex justify-between">
            <span>Tài sản sản phẩm (Product)</span>
            <span className="text-xs font-normal text-gray-400">{inputs.productImages.length} đã tải lên</span>
          </label>
          
          <div className="grid grid-cols-3 gap-2">
            {inputs.productImages.map((img) => (
              <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img src={img.data} alt="uploaded" className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeImage(img.id, 'productImages')}
                  className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => productInputRef.current?.click()}
              className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-gray-500"
            >
              <Upload className="w-5 h-5 mb-1" />
              <span className="text-[10px]">Thêm SP</span>
            </button>
          </div>
          <input 
            type="file" 
            ref={productInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => handleFileChange(e, 'productImages')} 
          />
          
          <textarea
             value={inputs.productInstructions}
             onChange={(e) => updateField('productInstructions', e.target.value)}
             placeholder="Ghi chú vị trí sản phẩm (ví dụ: 'Người mẫu cầm sản phẩm ở tay trái')"
             className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none text-sm min-h-[60px]"
          />
        </div>

        {/* 5. Text & Copy */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nội dung chữ (Typography)</label>
          
          <div className="space-y-2">
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wide">Tiêu đề chính (Heading)</span>
            <input
              type="text"
              value={inputs.mainHeading}
              onChange={(e) => updateField('mainHeading', e.target.value)}
              placeholder="ví dụ: SUMMER SALE"
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
            <select
              value={inputs.headingStyle}
              onChange={(e) => updateField('headingStyle', e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs cursor-pointer"
            >
               {HEADING_STYLES.map(style => (
                 <option key={style} value={style}>{style}</option>
               ))}
            </select>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wide">Tiêu đề phụ (Sub-heading)</span>
            <input
              type="text"
              value={inputs.subHeading}
              onChange={(e) => updateField('subHeading', e.target.value)}
              placeholder="ví dụ: Giảm giá 50% toàn bộ cửa hàng"
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* 6. Variations */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800 pb-4">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span>Số lượng biến thể</span>
            <span className="text-xs font-normal text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{inputs.variationCount}</span>
          </label>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">1</span>
            <input 
              type="range" 
              min="1" 
              max="5" 
              step="1"
              value={inputs.variationCount}
              onChange={(e) => updateField('variationCount', parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
            />
            <span className="text-xs text-gray-400">5</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            AI sẽ tạo {inputs.variationCount} thiết kế với các phong cách khác nhau.
          </p>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-10">
        <button
          onClick={onSubmit}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white p-3.5 rounded-xl font-semibold shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>Đang thiết kế...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Tạo thiết kế</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};