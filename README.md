# DailyLog Miniapp

Web app giao diện sáng (Mobile-first Miniapp) giúp ghi nhận công việc cố định hằng ngày & việc tùy biến phát sinh, có tổng kết Tuần / Tháng / Năm (Heatmap 52 tuần) và dùng **Google Sheets** làm Database miễn phí.

## Chạy thử trên máy

```bash
npm install
npm run dev
```

## Kết nối Google Sheets làm Database

1. Tạo một Google Sheet mới tại https://sheets.new
2. Mở **Tiện ích mở rộng (Extensions) → Apps Script**
3. Dán toàn bộ nội dung file `google-apps-script/Code.gs` vào và lưu lại
4. Bấm **Triển khai (Deploy) → Triển khai mới (New deployment)**
   - Loại: **Ứng dụng web (Web app)**
   - Thực thi với tư cách: **Tôi (Me)**
   - Ai có quyền truy cập: **Bất kỳ ai (Anyone)**
5. Copy URL Web App nhận được, mở Miniapp vào tab **Cài đặt**, dán URL vào và bấm **Đẩy lên Sheet**.
