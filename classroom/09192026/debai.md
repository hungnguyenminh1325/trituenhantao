Bài tập nhóm (theo nhóm BTL): Đánh giá mô hình học máy
Mục tiêu: Cài đặt thực nghiệm để đánh giá mô hình và hiểu ý nghĩa của các chỉ số trong bài toán đặc thù.
Thời gian: 60 phút | Công cụ: Google Colab / Python | Báo cáo trên classroom.
1. Bài toán và Dữ liệu
Bài toán: Dự báo giá nhà (bài toán hồi quy)
Nguồn dữ liệu: Tập dữ liệu demo có thể dùng Dự báo bất động sản (dataset: https://www.kaggle.com/datasets/quantbruce/real-estate-price-prediction)
2. Nhiệm vụ của nhóm
Các nhóm viết code Python thực hiện 3 bước sau và ghi câu trả lời ra báo cáo:
Bước 1: Huấn luyện mô hình cơ bản
Sử dụng thư viện có sẵn để tải dữ liệu, chia tập Train/Test (tỉ lệ 80/20) và huấn luyện một mô hình tùy chọn (ví dụ: LogisticRegression hoặc DecisionTreeClassifier).
Python
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
# Sinh viên tự code phần train mô hình...

Bước 2: Xuất báo cáo đánh giá
Sử dụng sklearn.metrics để in ra 2 kết quả sau trên tập Test:
Ma trận nhầm lẫn (confusion_matrix).
Bảng dự báo.
Bước 3: Thảo luận nghiệp vụ (Phần trọng tâm)
Dựa trên kết quả in ra, nhóm hãy thảo luận và trả lời ngắn gọn:
Trong bài dự báo giá nhà
Từ phân tích trên kết quả để đánh giá độ chính xác của mô hình

Lưu ý: 
- Chạy ít nhất 10 lần với bộ test và train khác nhau. Vẽ biểu đồ thể hiện kết quả độ chính xác.
- Nêu rõ công thức tính độ chính xác
- Làm việc theo nhóm BTL
- taoj baos caos wword trinhf bayf rox rangf kemf hinhf anhr keets quar cuar bai toan, 
- phan tich bai toan rorang fomat theo chuan doc:time new romen 13, phan chia de muc ro rang, ngon tu k doc ai hoa, phan tich va phai co bien buan chat che