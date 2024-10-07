** Link cập nhật tool và hướng dẫn chi tiết tại **
https://github.com/zuydd/tomarket

**_ Hướng dẫn cài đặt _**

- B1: Tải và giải nén tool
- B2: Chạy lệnh: npm install để cài đặt thư viện bổ trợ
- B3: vào thư mục src -> data, nhập query vào file users.txt và proxy vào file proxy.txt, không có proxy thì bỏ qua khỏi nhập

**_ Các lệnh chức năng chạy tool _**

- npm run start: dùng để chạy claim, làm nhiệm vụ, chơi game,.... tóm lại game có gì là nó làm cái đó
- npm run wallet: Dùng để liên kết ví
  các lệnh trên chạy hoàn toàn độc lập với nhau

🕹️ Các tính năng có trong tool:

- tự động daily check-in
- tự động làm nhiệm vụ
- tự động làm daily combo
- tự động claim
- tự động chơi game
- tự động nhận rank và nâng cấp rank
- tự động quay số
- nhận diện proxy tự động, tự động kết nối lại proxy khi bị lỗi. ae ai chạy proxy thì thêm vào file proxy.txt ở dòng ứng với dòng chứa acc muốn chạy proxy đó, acc nào không muốn chạy proxy thì để trống hoặc gõ skip vào
- đa luồng chạy bao nhiêu acc cũng được, không bị block lẫn nhau, lặp lại khi tới thời gian chơi game
- hiển thị đếm ngược tới lần chạy tiếp theo, có thể tìm biến `IS_SHOW_COUNTDOWN = true` đổi thành `false` để tắt cho đỡ lag
