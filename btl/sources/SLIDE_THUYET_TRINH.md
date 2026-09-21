### SLIDE 1: BÌA BÁO CÁO ĐỀ TÀI
* **🎙 Lời thoại phát biểu của sinh viên:**
> *"Kính chào Thầy Trần Xuân Thanh và toàn thể các bạn sinh viên trong lớp tín chỉ Trí tuệ nhân tạo. Hôm nay, đại diện cho Nhóm 10, em xin phép được báo cáo kết quả thực hiện Bài tập lớn với Mã đề số 02: 'Xây dựng mô phỏng trò chơi tìm đường trong mê cung bằng BFS, DFS và A*'. Trong đề tài này, nhóm em đã xây dựng thành công một hệ thống mô phỏng chạy song song đồng bộ cả 3 thuật toán, từ đó thực nghiệm đối sánh sâu sắc về mặt lý thuyết không gian trạng thái, tính tối ưu và hiệu năng thực tế. Em xin phép được bắt đầu phần trình bày."*

---

### SLIDE 2: TỔNG QUAN NỘI DUNG (AGENDA)
* **Tiêu đề:** CẤU TRÚC BÀI BÁO CÁO (4 PHẦN CHÍNH)
* **Nội dung hiển thị:**
  1. **Phát biểu bài toán:** Tên bài toán, Input, Output và Ý nghĩa thực tiễn.
  2. **Mô hình & Thuật toán:** Mô hình không gian trạng thái và nguyên lý BFS, DFS, A*.
  3. **Kết quả & Kết luận:** Bảng đối sánh số liệu thực nghiệm đa địa hình và 4 tiêu chuẩn AI.
  4. **Demo chương trình:** Các bước thực nghiệm trực tiếp trên phần mềm.
* **🎙 Lời thoại phát biểu của sinh viên:**
> *"Để Thầy và các bạn tiện theo dõi, bài báo cáo của nhóm em được tổ chức chặt chẽ theo 4 phần: Phần 1 sẽ phát biểu bài toán một cách tường minh về Input, Output và ý nghĩa khoa học. Phần 2 trình bày mô hình hóa không gian trạng thái toán học và cơ chế vận hành của 3 thuật toán. Phần 3 phân tích bảng số liệu thực nghiệm trên 4 dạng bản đồ tiêu biểu và rút ra kết luận. Và phần cuối cùng là kịch bản demo trực quan trên phần mềm mô phỏng."*

---

### SLIDE 3: PHẦN 1 — PHÁT BIỂU BÀI TOÁN
* **Tiêu đề:** TÊN BÀI TOÁN, DỮ LIỆU INPUT, OUTPUT & Ý NGHĨA KHOA HỌC
* **Nội dung hiển thị:**
  * **Tên bài toán:** Tìm kiếm đường đi ngắn nhất trong mê cung 2D từ Start (S) đến Goal (G).
  * **Input:**
    * Ma trận lưới kích thước $M \times N$ (mặc định $15 \times 15$, mở rộng $21 \times 21, 31 \times 31, 41 \times 41$).
    * Tọa độ điểm xuất phát $S(r_s, c_s)$ và điểm kết thúc $G(r_g, c_g)$.
    * Tập các ô tường vật cản không thể đi qua $\text{Grid}[r][c] = \text{WALL}$.
    * Hàm Heuristic khoảng cách đích dùng cho A* (Manhattan / Euclidean).
  * **Output:**
    * Dãy các ô tọa độ liên tiếp tạo thành đường đi từ $S$ đến $G$ (hoặc kết luận Vô nghiệm nếu bị cô lập).
    * Bộ chỉ số đo lường: Thời gian chạy (ms), Số ô đã duyệt (nodes), Độ dài đường đi (steps), Bộ nhớ đỉnh (Max Frontier).
  * **Ý nghĩa thực tiễn:** Nền tảng cho bản đồ dẫn đường Google Maps, robot tự hành AGV trong kho thông minh, AI tìm đường cho NPC trong game.
* **🎙 Lời thoại phát biểu của sinh viên:**
> *"Trước hết, về bài toán tìm đường trong mê cung: Đây là bài toán tìm kiếm đồ thị 2D kinh điển trong AI. Đầu vào của hệ thống gồm ma trận bản đồ lưới kích thước M nhân N, tọa độ xuất phát S, đích đến G và các vị trí tường cản. Riêng với A*, ta bổ sung hàm Heuristic đánh giá khoảng cách. Đầu ra của bài toán là đường dẫn ngắn nhất kết nối từ S tới G, kèm theo các thông số đo lường hiệu năng chuẩn xác như thời gian thực thi mili-giây, số ô đã duyệt và lượng bộ nhớ tiêu thụ. Về mặt ý nghĩa, bài toán không chỉ minh họa trực quan sự khác biệt giữa tìm kiếm mù và tìm kiếm có tri thức, mà còn là thuật toán lõi trong các hệ thống định vị GPS thực tế, robot dọn dẹp hút bụi và game phát triển thế giới ảo."*

---

### SLIDE 4: PHẦN 2 — MÔ HÌNH HÓA BÀI TOÁN
* **Tiêu đề:** MÔ HÌNH KHÔNG GIAN TRẠNG THÁI (STATE SPACE SEARCH)
* **Nội dung hiển thị:** 5 thành phần chính:
  1. **Trạng thái (State):** Cặp tọa độ ô $u = (r, c)$ trên lưới với $0 \le r < M, 0 \le c < N$ và ô đó không phải tường.
  2. **Trạng thái bắt đầu (Initial State):** Tọa độ $S(r_s, c_s)$.
  3. **Kiểm tra đích (Goal Test):** $\text{isGoal}(u) \iff (u.r == r_g \land u.c == c_g)$.
  4. **Tập hành động (Actions):** 4 hướng di chuyển: Lên $(r-1, c)$, Xuống $(r+1, c)$, Trái $(r, c-1)$, Phải $(r, c+1)$.
  5. **Chi phí bước đi (Step Cost):** $c(u, v) = 1$ đồng nhất cho mọi bước đi hợp lệ liền kề.
* **🎙 Lời thoại phát biểu của sinh viên:**
> *"Để máy tính có thể giải quyết được, bài toán thực tế cần được mô hình hóa theo lý thuyết không gian trạng thái gồm 5 thành phần chuẩn: Trạng thái u là cặp tọa độ dòng và cột trên bàn cờ. Trạng thái bắt đầu là điểm xuất phát S. Hàm kiểm tra đích xác định khi nào tác tử chạm tới tọa độ G. Tập hành động bao gồm 4 hướng di chuyển cơ bản: Lên, Xuống, Trái, Phải sang các ô lân cận hợp lệ. Chi phí mỗi bước đi c(u, v) được gán đồng nhất bằng 1. Đây là cơ sở toán học để cả 3 thuật toán vận hành và so sánh công bằng trên cùng một không gian tìm kiếm."*

---

### SLIDE 5: PHẦN 2.1 — THUẬT TOÁN BFS
* **Tiêu đề:** THUẬT TOÁN BFS (BREADTH-FIRST SEARCH) • HÀNG ĐỢI FIFO
* **Nội dung hiển thị:**
  * Cấu trúc dữ liệu: Hàng đợi FIFO Queue (Vào trước ra trước).
  * Cơ chế duyệt: Mở rộng đều ra xung quanh theo từng mức khoảng cách (tương tự vòng tròn sóng nước).
  * Ưu điểm: Đảm bảo 100% tìm thấy đường đi ngắn nhất tối ưu khi chi phí bước đồng nhất.
  * Nhược điểm: Độ phức tạp thời gian $\mathcal{O}(b^d)$ và bộ nhớ $\mathcal{O}(b^d)$ tăng theo cấp số nhân, tiêu tốn rất nhiều RAM do phải lưu trữ toàn bộ các ô cùng cấp.
* **🎙 Lời thoại phát biểu của sinh viên:**
> *"Thuật toán đầu tiên là Tìm kiếm theo chiều rộng BFS. BFS hoạt động dựa trên hàng đợi FIFO Queue. Cơ chế của nó là khám phá đồng tâm mở rộng đều ra mọi hướng theo từng mức khoảng cách giống như sóng radar lan tỏa. Điểm mạnh tuyệt đối của BFS là luôn đảm bảo tìm được đường đi ngắn nhất tối ưu khi chi phí các bước bằng nhau. Tuy nhiên, nhược điểm lớn nhất là độ phức tạp thời gian và không gian đều là O(b mũ d), gây tốn bộ nhớ RAM rất nhiều vì hàng đợi phải giữ tất cả các nút ở mức sâu hiện tại."*

---

### SLIDE 6: PHẦN 2.2 — THUẬT TOÁN DFS
* **Tiêu đề:** THUẬT TOÁN DFS (DEPTH-FIRST SEARCH) • NGĂN XẾP LIFO
* **Nội dung hiển thị:**
  * Cấu trúc dữ liệu: Ngăn xếp LIFO Stack (Vào sau ra trước) hoặc đệ quy.
  * Cơ chế duyệt: Luôn đi sâu nhất có thể theo một nhánh cho tới khi gặp ngõ cụt thì mới quay lui (Backtracking).
  * Ưu điểm: Tiết kiệm bộ nhớ vượt trội, độ phức tạp không gian chỉ là tuyến tính $\mathcal{O}(b \cdot m)$.
  * Nhược điểm: **Không đảm bảo tính tối ưu**, đường đi tìm được thường quanh co rất dài, dễ bị bẫy trong các nhánh cụt sâu.
* **🎙 Lời thoại phát biểu của sinh viên:**
> *"Trái ngược hoàn toàn với BFS là Tìm kiếm theo chiều sâu DFS, sử dụng ngăn xếp LIFO Stack. DFS luôn đâm sâu hết mức theo một nhánh lựa chọn cho tới khi gặp ngõ cụt thì mới quay lui (backtrack) để thử nhánh khác. Ưu điểm nổi bật của DFS là cực kỳ tiết kiệm bộ nhớ RAM, độ phức tạp không gian chỉ là O(b nhân m) tuyến tính, nhỏ hơn rất nhiều so với BFS. Nhưng nhược điểm nghiêm trọng là KHÔNG TỐI ƯU, đường đi tìm được thường rất dài, phụ thuộc vào thứ tự rẽ nhánh và có nguy cơ bị cuốn vào các nhánh cụt rất sâu."*

---

### SLIDE 7: PHẦN 2.3 — THUẬT TOÁN A*
* **Tiêu đề:** THUẬT TOÁN A* • HÀM ĐÁNH GIÁ $f(n) = g(n) + h(n)$ & MIN-HEAP
* **Nội dung hiển thị:**
  * Hàm đánh giá: $f(n) = g(n) + h(n)$.
    * $g(n)$: Chi phí thực tế đã đi từ $S$ đến $n$.
    * $h(n)$: Hàm Heuristic ước lượng khoảng cách từ $n$ đến đích $G$.
    * $f(n)$: Dự đoán tổng chi phí đường đi tốt nhất đi qua $n$.
  * Hàm Heuristic sử dụng: Khoảng cách Manhattan $h(n) = |r_n - r_g| + |c_n - c_g|$ (Admissible, bảo đảm tối ưu).
  * Cấu trúc dữ liệu: Hàng đợi ưu tiên Min-Heap (lấy nút có $f(n)$ nhỏ nhất trong $\mathcal{O}(\log N)$).
  * Ưu điểm: **Tối ưu kép** — vừa tìm đường ngắn nhất hoàn hảo như BFS, vừa giảm thiểu 60% – 85% số ô duyệt thừa.
* **🎙 Lời thoại phát biểu của sinh viên:**
> *"Để khắc phục nhược điểm tốn RAM của BFS và kém tối ưu của DFS, thuật toán A* ra đời. A* là thuật toán tìm kiếm có thông tin, sử dụng hàm đánh giá f(n) = g(n) + h(n), trong đó g(n) là chi phí thực tế đã đi và h(n) là hàm Heuristic ước lượng khoảng cách tới đích. Trên bản đồ lưới 4 hướng, nhóm em sử dụng hàm khoảng cách Manhattan. Vì Manhattan là hàm Heuristic chấp nhận được (Admissible), A* được chứng minh toán học là luôn tìm ra đường đi ngắn nhất tối ưu tương đương BFS, nhưng lại định hướng chùm tia duyệt thẳng về phía đích, giúp cắt giảm từ 60% đến 85% số ô duyệt thừa."*

---

### SLIDE 8: PHẦN 3 — KẾT QUẢ THỰC NGHIỆM ĐỐI SÁNH
* **Tiêu đề:** BẢNG ĐỐI SÁNH HIỆU NĂNG THỰC TẾ TRÊN CÁC DẠNG ĐỊA HÌNH
* **Nội dung hiển thị:** Bảng số liệu đo đạc trực tiếp trên lưới $21 \times 21$:
  * **Bãi vật cản mở:** BFS duyệt 290 ô (37 bước, 3.07 ms); DFS duyệt 64 ô (51 bước, 0.77 ms); A* chỉ duyệt **55 ô** (đường đi tối ưu **37 bước**, 1.01 ms).
  * **Xoắn ốc:** BFS duyệt 99 ô (19 bước); DFS duyệt 194 ô (25 bước - bị lạc vòng); A* chỉ duyệt **43 ô** (19 bước).
  * **Bẫy vô nghiệm:** Cả 3 thuật toán duyệt hết ô thông và dừng an toàn, thông báo "Vô nghiệm".
* **🎙 Lời thoại phát biểu của sinh viên:**
> *"Bước sang Phần 3: Đây là bảng số liệu thực nghiệm đo đạc trực tiếp từ phần mềm của nhóm em trên lưới cờ chuẩn 21 nhân 21. Kính mời Thầy và các bạn quan sát: Tại bản đồ Bãi vật cản mở, BFS phải duyệt tới 290 ô mới tìm thấy đích, trong khi A* chỉ cần duyệt 55 ô mà vẫn tìm ra đúng đường đi tối ưu 37 bước — tức là A* tiết kiệm hơn 81% số ô duyệt so với BFS. Tại địa hình xoắn ốc, DFS bị đánh lừa đi lạc theo vòng xoắn, duyệt tới 194 ô và đường đi dài 25 bước. Đặc biệt tại bản đồ bẫy vô nghiệm, cả 3 thuật toán đều duyệt hết không gian và dừng an toàn, chứng minh thuật toán không bị treo hay lặp vô hạn."*

---

### SLIDE 9: PHẦN 3.1 — ĐÁNH GIÁ 4 TIÊU CHUẨN AI
* **Tiêu đề:** ĐÁNH GIÁ 3 THUẬT TOÁN THEO 4 TIÊU CHUẨN KINH ĐIỂN CỦA AI
* **Nội dung hiển thị:**
  1. **Tính đầy đủ (Completeness):** Cả 3 đều đầy đủ (với không gian hữu hạn).
  2. **Tính tối ưu (Optimality):** BFS và A* luôn tối ưu ngắn nhất; DFS không tối ưu.
  3. **Thời gian (Time):** A* nhanh nhất nhờ Heuristic cắt tỉa; DFS thất thường; BFS chậm ở không gian mở.
  4. **Không gian bộ nhớ (Space):** DFS tiết kiệm RAM nhất $\mathcal{O}(b \cdot m)$; BFS tốn RAM nhất $\mathcal{O}(b^d)$; A* ở mức trung gian tối ưu.
* **🎙 Lời thoại phát biểu của sinh viên:**
> *"Tổng kết dưới góc độ 4 tiêu chuẩn kinh điển của môn Trí tuệ nhân tạo: Về tính đầy đủ, cả 3 thuật toán đều đảm bảo tìm ra lời giải. Về tính tối ưu, chỉ có BFS và A* là tối ưu, còn DFS không đảm bảo. Về thời gian, A* vượt trội nhờ Heuristic dẫn đường cắt tỉa không gian tìm kiếm. Về bộ nhớ, DFS tiết kiệm RAM nhất, còn BFS tốn nhiều bộ nhớ nhất. Từ đó khẳng định A* là thuật toán cân bằng hoàn hảo nhất giữa tốc độ, bộ nhớ và chất lượng đường đi."*

---

### SLIDE 10: PHẦN 3.2 — KẾT LUẬN & HƯỚNG PHÁT TRIỂN
* **Tiêu đề:** KẾT LUẬN KHOA HỌC & HƯỚNG MỞ RỘNG PHÁT TRIỂN
* **Nội dung hiển thị:**
  * **Kết luận:** Đã hoàn thành 100% mục tiêu đề tài; xác nhận chân lý lý thuyết qua thực nghiệm; kiểm soát tính dừng an toàn.
  * **Hướng phát triển:** Mở rộng 8 hướng di chuyển (bước đi chéo $c = \sqrt{2}$), bản đồ có trọng số địa hình gồ ghề (Weighted Map), thuật toán tối ưu nâng cao Jump Point Search (JPS) và Hierarchical A* (HPA*).
* **🎙 Lời thoại phát biểu của sinh viên:**
> *"Tóm lại, đề tài đã hoàn thành xuất sắc 100% mục tiêu đặt ra. Nhóm em đã chứng minh thực tế rằng tìm kiếm có tri thức (Informed Search) luôn là giải pháp tối ưu cho bài toán định vị. Về hướng phát triển tiếp theo, nhóm đề xuất mở rộng thuật toán sang 8 hướng di chuyển với bước đi chéo, áp dụng trọng số địa hình bùn lầy, và nghiên cứu biến thể Jump Point Search (JPS) giúp tăng tốc độ tìm đường lên gấp hàng chục lần trên các bản đồ game quy mô lớn."*

---

### SLIDE 11: PHẦN 4 — KỊCH BẢN DEMO THỰC NGHIỆM
* **Tiêu đề:** KỊCH BẢN CÁC BƯỚC CHẠY DEMO PHẦN MỀM
* **Nội dung hiển thị:** 4 bước demo:
  * *Bước 1:* Bấm 'Chạy song song' trên lưới $15 \times 15$ để quan sát cùng lúc 3 hình thái duyệt.
  * *Bước 2:* Thử nghiệm bản đồ Bãi vật cản ngẫu nhiên (Open Field) để minh chứng sự vượt trội của A*.
  * *Bước 3:* Thử nghiệm Mê cung xoắn ốc và Bẫy không lối thoát (No-Path).
  * *Bước 4:* Phân tích bảng KPI và 3 biểu đồ cột Chart.js theo thời gian thực.
* **🎙 Lời thoại phát biểu của sinh viên:**
> *"Bây giờ, nhóm em xin phép được chuyển sang Phần 4: Demo thực tế phần mềm mô phỏng. Kịch bản demo sẽ gồm 4 bước: Đầu tiên bấm Chạy song song trên lưới 15 nhân 15 để hội đồng quan sát trực tiếp 3 cơ chế duyệt. Thứ hai là đổi sang bản đồ bãi vật cản mở để đối sánh số ô duyệt của A* và BFS. Thứ ba là kiểm tra bản đồ xoắn ốc và bẫy vô nghiệm. Và cuối cùng là đối chiếu các biểu đồ hiệu năng đo đạc tự động. Em xin phép mở phần mềm để tiến hành demo."*

---

### SLIDE 12: KẾT THÚC & HỎI ĐÁP (Q&A)
* **Tiêu đề:** XIN TRÂN TRỌNG CẢM ƠN THẦY CÔ VÀ CÁC BẠN!
* **Nội dung hiển thị:** Lời cảm ơn giảng viên hướng dẫn và hội đồng; mở phần thảo luận Q&A; nút bấm chuyển tiếp sang giao diện Live Demo.
* **🎙 Lời thoại phát biểu của sinh viên:**
> *"Đến đây, Nhóm 10 xin phép kết thúc phần báo cáo lý thuyết và kết quả nghiên cứu. Nhóm em xin chân thành cảm ơn Thầy Trần Xuân Thanh đã tận tình hướng dẫn và các bạn đã chú ý lắng nghe. Nhóm em rất mong nhận được những câu hỏi phản biện và đóng góp quý báu từ Thầy để bài tập lớn được hoàn thiện hơn nữa. Em xin trân trọng cảm ơn!"*

---

## 💡 BỘ CÂU HỎI VẤN ĐÁP (Q&A) THƯỜNG GẶP VÀ CÂU TRẢ LỜI MẪU

### Câu hỏi 1: Tại sao thuật toán BFS luôn tìm được đường đi ngắn nhất trong khi DFS thì không?
* **Trả lời:** Vì BFS duyệt đồ thị theo từng mức khoảng cách (level by level). Mọi nút cách điểm xuất phát $k$ bước đều được duyệt trước các nút cách $k+1$ bước. Do đó, khi lần đầu tiên BFS chạm tới đích $G$, đường đi tới $G$ chắc chắn có số bước ít nhất. Trong khi đó, DFS luôn đâm sâu theo một nhánh ngẫu nhiên đầu tiên mà nó gặp cho tới cùng, nên nếu nhánh đó dẫn tới đích thì DFS sẽ kết luận ngay mà không biết rằng có một nhánh rẽ khác ngắn hơn nhiều.

### Câu hỏi 2: Hàm Heuristic của A* phải thỏa mãn điều kiện gì để đảm bảo luôn tìm được đường đi tối ưu?
* **Trả lời:** Hàm Heuristic $h(n)$ phải thỏa mãn tính chất **chấp nhận được (Admissible)**, tức là $0 \le h(n) \le h^*(n)$ với mọi nút $n$, trong đó $h^*(n)$ là chi phí thực tế ngắn nhất từ $n$ đến đích. Nghĩa là $h(n)$ không bao giờ được ước lượng cao hơn thực tế. Trên đồ thị lưới 4 hướng di chuyển không có đường chéo, khoảng cách Manhattan chính là khoảng cách ngắn nhất có thể nên nó là hàm Admissible, bảo đảm A* luôn tìm được đường tối ưu tuyệt đối.

### Câu hỏi 3: Trong trường hợp bài toán vô nghiệm (điểm đích bị tường vây kín), thuật toán nào dừng nhanh nhất?
* **Trả lời:** Cả 3 thuật toán đều phải duyệt toàn bộ vùng không gian ô thông có thể đến được (connected component) chứa điểm xuất phát $S$ thì mới kết luận được vô nghiệm. Tuy nhiên, thời gian thực thi của DFS thường nhanh hơn một chút do thao tác trên ngăn xếp Stack (mảng) có chi phí thêm bớt phần tử nhẹ hơn thao tác của Hàng đợi ưu tiên Min-Heap trong A*.

### Câu hỏi 4: Có thể tối ưu thêm A* bằng cách nào trong các bài toán thực tế lớn hơn?
* **Trả lời:** Ta có thể áp dụng thuật toán **Jump Point Search (JPS)** để nhảy cóc qua các nút đối xứng trên bản đồ lưới phẳng, giúp giảm số lượng nút cần đưa vào Min-Heap; hoặc sử dụng **IDA* (Iterative Deepening A*)** để giới hạn bộ nhớ theo ngưỡng $f$; hoặc phân cấp bản đồ dạng **Hierarchical A* (HPA*)** đối với game có bản đồ rộng hàng nghìn ô.
