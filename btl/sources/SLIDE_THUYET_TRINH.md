### SLIDE 1: BÌA BÁO CÁO ĐỀ TÀI
* **Chào hỏi:** Kính chào Thầy Trần Xuân Thanh và toàn thể các bạn sinh viên trong lớp tín chỉ Trí tuệ nhân tạo.
* **Giới thiệu:** Em đại diện Nhóm 10 báo cáo kết quả Bài tập lớn - Mã đề số 02: *"Xây dựng mô phỏng trò chơi tìm đường trong mê cung bằng BFS, DFS và A\*"*.
* **Điểm nổi bật:** Nhóm đã xây dựng hệ thống chạy song song 3 thuật toán, đối sánh trực quan từ lý thuyết không gian trạng thái đến hiệu năng thực tế.
* **Bắt đầu:** Sau đây em xin phép được bắt đầu phần trình bày.

---

### SLIDE 2: TỔNG QUAN NỘI DUNG (AGENDA)
* **Dẫn nhập:** Bài báo cáo hôm nay gồm 4 phần chính:
* **Phần 1:** Phát biểu bài toán, làm rõ Input, Output và ý nghĩa thực tế.
* **Phần 2:** Mô hình hóa không gian trạng thái và cơ chế hoạt động của 3 thuật toán BFS, DFS, A*.
* **Phần 3:** Phân tích bảng số liệu thực nghiệm trên 4 dạng địa hình và đánh giá theo 4 tiêu chuẩn AI.
* **Phần 4:** Kịch bản demo thực tế trực tiếp trên phần mềm mô phỏng.

---

### SLIDE 3: PHẦN 1 — PHÁT BIỂU BÀI TOÁN
* **Bản chất bài toán:** Đây là bài toán tìm kiếm đồ thị 2D kinh điển trong Trí tuệ nhân tạo.
* **Đầu vào (Input):** Ma trận lưới $M \times N$, tọa độ điểm xuất phát $S$, đích đến $G$ và vị trí các tường cản (riêng A* có thêm hàm Heuristic khoảng cách).
* **Đầu ra (Output):** Đường đi ngắn nhất từ $S$ đến $G$ (hoặc báo vô nghiệm), kèm các thông số: thời gian chạy (ms), số ô duyệt và đỉnh bộ nhớ RAM.
* **Ý nghĩa thực tiễn:** Là thuật toán cốt lõi ứng dụng trong bản đồ định vị GPS (Google Maps), robot tự hành AGV trong kho thông minh và điều hướng NPC trong game.

---

### SLIDE 4: PHẦN 2 — MÔ HÌNH HÓA KHÔNG GIAN TRẠNG THÁI
* **Mục đích:** Để giải quyết bằng thuật toán, bài toán được mô hình hóa theo 5 thành phần chuẩn của không gian trạng thái:
* **1. Trạng thái ($u$):** Cặp tọa độ $(r, c)$ của các ô hợp lệ trên bàn cờ.
* **2. Khởi đầu & Đích:** Tọa độ ban đầu $S(r_s, c_s)$ và điều kiện kiểm tra khi chạm tới đích $G(r_g, c_g)$.
* **3. Tập hành động:** 4 hướng di chuyển cơ bản (Lên, Xuống, Trái, Phải) sang ô liền kề không phải tường.
* **4. Chi phí bước:** Đồng nhất $c(u, v) = 1$ cho mọi bước đi hợp lệ.
* **Ý nghĩa:** Đây là cơ sở toán học chung giúp so sánh công bằng cả 3 thuật toán trên cùng một mê cung.

---

### SLIDE 5: PHẦN 2.1 — THUẬT TOÁN BFS
* **Cấu trúc lõi:** BFS hoạt động dựa trên hàng đợi FIFO Queue (vào trước, ra trước).
* **Cơ chế duyệt:** Khám phá đồng tâm, mở rộng đều ra mọi hướng theo từng lớp khoảng cách (như sóng nước lan tỏa).
* **Ưu điểm lớn nhất:** Đảm bảo 100% luôn tìm ra đường đi ngắn nhất tối ưu khi chi phí các bước đồng nhất.
* **Nhược điểm cốt tử:** Cực kỳ tốn RAM, cả độ phức tạp thời gian và không gian đều là $\mathcal{O}(b^d)$ (tăng theo cấp số nhân), dễ tràn bộ nhớ ở mê cung lớn.

---

### SLIDE 6: PHẦN 2.2 — THUẬT TOÁN DFS
* **Cấu trúc lõi:** Ngược lại với BFS, DFS sử dụng ngăn xếp LIFO Stack (vào sau, ra trước) hoặc đệ quy.
* **Cơ chế duyệt:** Luôn đâm sâu tối đa theo một nhánh lựa chọn; chỉ khi gặp ngõ cụt thì mới quay lui (Backtrack) để thử nhánh khác.
* **Ưu điểm nổi trội:** Vô cùng tiết kiệm bộ nhớ RAM, độ phức tạp không gian chỉ là tuyến tính $\mathcal{O}(b \cdot m)$.
* **Nhược điểm nghiêm trọng:** Không đảm bảo tính tối ưu, đường đi tìm được thường quanh co rất dài và có nguy cơ bị cuốn vào các nhánh cụt sâu.

---

### SLIDE 7: PHẦN 2.3 — THUẬT TOÁN A*
* **Mục đích ra đời:** A* kết hợp ưu điểm của cả hai: vừa tìm đường ngắn nhất tối ưu, vừa khắc phục việc tốn bộ nhớ và thời gian.
* **Hàm đánh giá:** $f(n) = g(n) + h(n)$, trong đó $g(n)$ là chi phí thực tế đã đi và $h(n)$ là Heuristic ước lượng khoảng cách tới đích.
* **Hàm Heuristic áp dụng:** Sử dụng khoảng cách Manhattan — đây là hàm chấp nhận được (Admissible) nên bảo đảm A* luôn tìm ra lời giải tối ưu tuyệt đối.
* **Cấu trúc dữ liệu:** Sử dụng Hàng đợi ưu tiên Min-Heap để luôn lấy ra nút có triển vọng nhất $f(n)$ nhỏ nhất trong $\mathcal{O}(\log N)$.
* **Hiệu quả vượt trội:** Vẫn tìm ra đường đi ngắn nhất y hệt BFS, nhưng định hướng chùm tia duyệt thẳng về đích giúp giảm từ 60% đến 85% số ô duyệt thừa.

---

### SLIDE 8: PHẦN 3 — KẾT QUẢ THỰC NGHIỆM ĐỐI SÁNH
* **Dẫn chứng số liệu:** Đây là bảng đo đạc thực tế từ phần mềm của nhóm trên lưới kích thước $21 \times 21$:
* **Bãi vật cản mở:** BFS phải duyệt tới 290 ô, trong khi A* chỉ cần duyệt 55 ô mà vẫn đạt đường đi tối ưu 37 bước — tức A* tiết kiệm hơn 81% số ô duyệt.
* **Mê cung xoắn ốc:** DFS bị đánh lừa đi theo vòng xoắn dài, duyệt tới 194 ô và đường đi tốn 25 bước (kém tối ưu).
* **Bẫy vô nghiệm:** Cả 3 thuật toán đều duyệt hết không gian thông và dừng lại an toàn, chứng minh mã nguồn kiểm soát tốt điều kiện dừng, không bị lặp vô hạn hay treo app.

---

### SLIDE 9: PHẦN 3.1 — ĐÁNH GIÁ 4 TIÊU CHUẨN AI
* **1. Tính đầy đủ (Completeness):** Cả 3 thuật toán đều đảm bảo tìm ra nghiệm trong không gian trạng thái hữu hạn.
* **2. Tính tối ưu (Optimality):** Chỉ có BFS và A* đảm bảo đường đi ngắn nhất; DFS hoàn toàn không đảm bảo.
* **3. Thời gian (Time):** A* nhanh nhất nhờ Heuristic cắt tỉa không gian tìm kiếm; BFS chậm ở không gian mở; DFS biến thiên thất thường.
* **4. Không gian bộ nhớ (Space):** DFS tiết kiệm RAM nhất $\mathcal{O}(b \cdot m)$; BFS tốn RAM nhất $\mathcal{O}(b^d)$; A* đạt mức trung gian tối ưu.
* **Kết luận khoa học:** A* là thuật toán cân bằng hoàn hảo nhất giữa tốc độ, bộ nhớ và chất lượng đường đi.

---

### SLIDE 10: PHẦN 3.2 — KẾT LUẬN & HƯỚNG PHÁT TRIỂN
* **Kết luận:** Đề tài đã hoàn thành 100% mục tiêu, chứng minh bằng thực nghiệm rằng tìm kiếm có tri thức (Informed Search) luôn vượt trội so với tìm kiếm mù.
* **Hướng mở rộng 1:** Nâng cấp lên di chuyển 8 hướng (cho phép đi chéo với chi phí bước $\sqrt{2}$).
* **Hướng mở rộng 2:** Tích hợp trọng số địa hình (như vũng lầy, dốc cao) thay vì chi phí đồng nhất.
* **Hướng mở rộng 3:** Nghiên cứu các thuật toán nâng cao như Jump Point Search (JPS) hoặc Hierarchical A* (HPA*) cho các bản đồ game quy mô cực lớn.

---

### SLIDE 11: PHẦN 4 — KỊCH BẢN DEMO THỰC NGHIỆM
* **Dẫn vào Demo:** Sau đây em xin phép được demo trực tiếp phần mềm mô phỏng theo 4 bước:
* **Bước 1:** Bấm *Chạy song song* trên lưới chuẩn $15 \times 15$ để Hội đồng quan sát trực quan 3 cơ chế lan truyền duyệt của 3 thuật toán cùng lúc.
* **Bước 2:** Chuyển sang địa hình *Bãi vật cản mở* để minh chứng khả năng cắt tỉa số ô duyệt vượt trội của A* so với BFS.
* **Bước 3:** Thử nghiệm với bản đồ *Xoắn ốc* và bẫy *Vô nghiệm* để kiểm tra tính đúng đắn và tính dừng.
* **Bước 4:** Đối chiếu các chỉ số trên bảng KPI và 3 biểu đồ thống kê Chart.js trực quan.
* **Chuyển giao:** Em xin phép mở phần mềm để bắt đầu thao tác.

---

### SLIDE 12: KẾT THÚC & HỎI ĐÁP (Q&A)
* **Lời kết:** Đến đây Nhóm 10 xin phép kết thúc phần báo cáo lý thuyết và số liệu nghiên cứu.
* **Tri ân:** Nhóm xin chân thành cảm ơn Thầy Trần Xuân Thanh đã tận tình hướng dẫn và cảm ơn các bạn sinh viên đã chú ý lắng nghe.
* **Mở Q&A:** Nhóm rất mong nhận được những nhận xét, góp ý và câu hỏi phản biện từ Thầy để bài làm được hoàn thiện hơn nữa.
* **Cảm ơn:** Em xin trân trọng cảm ơn!

---

### PHẦN HỎI ĐÁP (Q&A) — CÂU HỎI VÀ GỢI Ý TRẢ LỜI NHANH

* **Câu 1: Tại sao BFS luôn tìm được đường ngắn nhất còn DFS thì không?**
  * BFS duyệt theo từng tầng khoảng cách: nút cách $k$ bước luôn duyệt trước nút cách $k+1$ bước, nên khi chạm tới đích lần đầu tiên thì đó chắc chắn là đường ngắn nhất.
  * DFS đâm sâu theo nhánh đầu tiên gặp được; nếu nhánh đó dẫn tới đích thì DFS nhận luôn mà không biết có nhánh rẽ khác ngắn hơn.

* **Câu 2: Hàm Heuristic của A* cần điều kiện gì để luôn tối ưu?**
  * Phải thỏa mãn tính **chấp nhận được (Admissible)**: $h(n) \le h^*(n)$ (không bao giờ ước lượng cao hơn khoảng cách thực tế).
  * Trong lưới 4 hướng đi, khoảng cách Manhattan là khoảng cách ngắn nhất có thể nên nó là Admissible $\implies$ A* luôn tối ưu.

* **Câu 3: Khi mê cung vô nghiệm (đích bị tường vây kín), thuật toán nào dừng nhanh nhất?**
  * Cả 3 đều phải duyệt hết toàn bộ vùng ô thông có thể đến được mới kết luận vô nghiệm.
  * DFS thường nhanh hơn một chút về thời gian chạy do thao tác trên Stack (mảng) nhẹ hơn thao tác trên Hàng đợi ưu tiên Min-Heap của A*.

* **Câu 4: Có thể tối ưu thêm A* bằng cách nào cho bản đồ thực tế lớn hơn?**
  * Dùng **Jump Point Search (JPS)** để nhảy cóc qua các ô đối xứng trên bản đồ phẳng.
  * Dùng **IDA\*** để giới hạn ngưỡng $f$, tối ưu bộ nhớ RAM.
  * Dùng **Hierarchical A\* (HPA\*)** phân cấp bản đồ thành các cụm nhỏ (áp dụng cho game bản đồ lớn).

* **Câu 5: Cấu trúc code của 3 thuật toán trong chương trình được tổ chức như thế nào?**
  * Thiết kế theo mô hình **Hướng đối tượng (OOP)**: Lớp cha `PathfindingAlgorithm` chứa tài nguyên chung (`visited`, `parent`, `getNeighbors`, `reconstructPath`).
  * Cả 3 thuật toán kế thừa và cài đặt hàm **`step()` từng bước** thay vì dùng vòng lặp `while`, giúp chương trình chạy song song và vẽ animation mượt mà trên Canvas mà không bị đơ UI.
  * **BFS:** Dùng mảng `queue`, lấy ra bằng `shift()` (chuẩn FIFO).
  * **DFS:** Dùng mảng `stack`, lấy ra bằng `pop()` (chuẩn LIFO).
  * **A\*:** Tự viết cấu trúc cây nhị phân `MinHeap`, quản lý $gScore$, dùng `closedSet` và hàm Heuristic khoảng cách Manhattan.

* **Câu 6: Tại sao DFS không dùng hàm đệ quy (Recursion) mà lại dùng mảng Stack?**
  * Nếu dùng đệ quy trên bản đồ lớn ($31 \times 31, 41 \times 41$), độ sâu có thể tới hàng nghìn bước $\implies$ gây lỗi **tràn ngăn xếp lời gọi hàm (Call Stack Overflow)** làm treo trình duyệt.
  * Dùng mảng mô phỏng Stack trên bộ nhớ Heap giúp an toàn tuyệt đối và dễ dàng ngắt nghỉ từng bước để hiển thị trực quan.

* **Câu 7: Tại sao trong A* nhóm phải tự viết MinHeap mà không dùng `array.sort()`?**
  * Dùng `array.sort()` mất độ phức tạp $\mathcal{O}(N \log N)$ mỗi bước $\implies$ làm giật lag giao diện khi số nút chờ lên đến hàng trăm.
  * Tự cài đặt `MinHeap` (với `_bubbleUp` và `_sinkDown`) giúp lấy ra nút có $f$ nhỏ nhất chỉ mất $\mathcal{O}(\log N)$, tối ưu tối đa hiệu năng.

* **Câu 8: Thuật toán truy vết đường đi (`reconstructPath`) hoạt động như thế nào?**
  * Suốt quá trình duyệt, khi ô $v$ được sinh ra từ ô $u$, code lưu vào bảng tra: `parent.set(v, u)`.
  * Khi chạm đích `Goal`, dùng vòng lặp lùi từ `Goal` ngược về cha của nó cho đến `Start`, sau đó gọi `.reverse()` để thu được chuỗi tọa độ chuẩn từ xuất phát đến đích.

* **Câu 9: Điểm xử lý tối ưu thông minh trong MinHeap của nhóm là gì? (Tie-breaking)**
  * Trong điều kiện đổi chỗ của Heap: Khi hai nút có cùng giá trị $f$, code ưu tiên nút có $h$ nhỏ hơn (`element.f === parent.f && element.h < parent.h`).
  * Nhờ ưu tiên nút gần đích hơn, A* tập trung đâm thẳng tia tìm kiếm về đích, không bị phân tán sang hai bên.

* **Câu 10: Làm thế nào để thuật toán nhận biết bài toán Vô nghiệm (No Path)?**
  * Trong mỗi bước `step()`, trước khi lấy phần tử, code kiểm tra xem tập chờ có rỗng hay không (`queue.length === 0` hoặc `openHeap.isEmpty()`).
  * Nếu tập chờ đã rỗng mà chưa chạm tới đích $\implies$ đã duyệt hết toàn bộ vùng thông nhau, gán `status = 'no_path'`, dừng an toàn và thông báo lên giao diện.
