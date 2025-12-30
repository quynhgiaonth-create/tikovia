#!/bin/bash
# Lấy đường dẫn thư mục hiện tại
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP_NAME="Tikovia Banner AI.app"
APP_PATH="$DIR/$APP_NAME"

echo "------------------------------------------------"
echo "Đang sửa lỗi cho ứng dụng: $APP_NAME"
echo "------------------------------------------------"

# Kiểm tra xem App có nằm cùng thư mục không
if [ ! -d "$APP_PATH" ]; then
    # Thử tìm trong thư mục Applications nếu người dùng đã copy vào đó
    APP_PATH="/Applications/$APP_NAME"
fi

if [ -d "$APP_PATH" ]; then
    echo "Tìm thấy ứng dụng tại: $APP_PATH"
    echo "Vui lòng nhập mật khẩu máy Mac để cấp quyền (Mật khẩu sẽ không hiện ký tự):"
    
    # Chạy lệnh xattr (cần quyền sudo)
    sudo xattr -cr "$APP_PATH"
    
    # Ký lại ứng dụng bằng chữ ký ảo (giúp tránh một số lỗi khác)
    sudo codesign --force --deep --sign - "$APP_PATH"
    
    echo ""
    echo "✅ Đã sửa lỗi xong! Bạn có thể mở ứng dụng ngay bây giờ."
else
    echo "❌ Không tìm thấy ứng dụng!"
    echo "Vui lòng đặt file này nằm CÙNG THƯ MỤC với file ứng dụng (hoặc copy ứng dụng vào Applications trước)."
fi

echo ""
echo "Nhấn phím bất kỳ để thoát..."
read -n 1
