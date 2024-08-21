**_ Hướng dẫn cài đặt _**

- B1: Tải và giải nén tool
- B2: Chạy lệnh: npm install để cài đặt thư viện bổ trợ
- B3: vào thư mục src -> data, nhập query vào file users.txt và proxy vào file proxy.txt, không có proxy thì bỏ qua khỏi nhập

**_ Các lệnh chức năng chạy tool _**

- npm run start: dùng để chạy claim, làm nhiệm vụ, chơi game,.... tóm lại game có gì là nó làm cái đó
- npm run claim-star: để claim sao (star)
  các lệnh trên chạy hoàn toàn độc lập với nhau

🕹️ Các tính năng có trong tool:

- tự động làm nhiệm vụ
- tự động làm dayly combo
- tự động claim
- tự động chơi game
- tự động daily check-in
- claim star
- nhận diện proxy tự động, ae ai chạy proxy thì thêm vào file proxy.txt ở dòng ứng với dòng chứa acc muốn chạy proxy đó, acc nào không muốn chạy proxy thì để trống hoặc gõ skip vào
- đa luồng chạy bao nhiêu acc cũng được, không bị block lẫn nhau
