#!/bin/bash
clear
echo "============================================="
echo "   CÔNG CỤ SỬA LỖI MỞ APP (TIKOVIA BANNER)   "
echo "============================================="
echo ""
echo "Máy Mac không tìm thấy ứng dụng ở thư mục mặc định."
echo "Để sửa lỗi chính xác, bạn hãy làm thao tác sau:"
echo ""
echo "👉 BƯỚC 1: Tìm file 'Tikovia Banner AI' (hình cái khiên hoặc logo app)."
echo "👉 BƯỚC 2: Kéo và Thả file đó vào cửa sổ màu đen này."
echo "👉 BƯỚC 3: Nhấn phím Enter."
echo ""
echo -n "Kéo file vào đây rồi nhấn Enter > "
read USER_PATH

# Xử lý đường dẫn (xóa dấu ngoặc kép nếu có)
USER_PATH="${USER_PATH%\"}"
USER_PATH="${USER_PATH#\"}"
# Xóa khoảng trắng thừa đuôi
USER_PATH="$(echo -e "${USER_PATH}" | sed -e 's/[[:space:]]*$//')"

echo ""
echo "Đang xử lý cho: $USER_PATH"

if [ -d "$USER_PATH" ]; then
    echo "🔑 Vui lòng nhập mật khẩu máy Mac (Màn hình sẽ KHÔNG hiện gì khi gõ):"
    sudo xattr -cr "$USER_PATH"
    sudo codesign --force --deep --sign - "$USER_PATH"
    echo ""
    echo "✅ THÀNH CÔNG! Đã sửa lỗi xong."
    echo "Bây giờ bạn hãy mở lại ứng dụng nhé."
else
    echo "❌ LỖI: Đường dẫn không đúng hoặc không tìm thấy file."
    echo "Bạn hãy thử chạy lại file này và làm lại nhé."
fi

echo ""
echo "Nhấn phím bất kỳ để thoát..."
read -n 1
