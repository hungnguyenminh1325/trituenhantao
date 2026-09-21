import sys
import io


if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import confusion_matrix, classification_report

CONFIG = {
    "test_size": 0.2,

    "random_state": 42,

    "use_stratify": True,

    "model_type": "decision_tree",

    "decision_tree_max_depth": 4,
    "threshold": 0.25
}

def main():
    print("=" * 68)
    print(" BÀI THỰC HÀNH ML 2: ĐÁNH GIÁ MÔ HÌNH HỌC MÁY")
    print(f" Cấu hình: Model={CONFIG['model_type']} | test_size={CONFIG['test_size']} | random_state={CONFIG['random_state']}")
    print("=" * 68)

    # BƯỚC 1: TẢI VÀ CHUẨN BỊ DỮ LIỆU
    cancer = load_breast_cancer()
    X = cancer.data
    
    # Chuẩn hóa nhãn: 0 = Lành tính (Benign), 1 = Ác tính (Malignant)
    y = 1 - cancer.target
    target_names = ['Lành tính (0 - Benign)', 'Ác tính (1 - Malignant)']
    
    print(f"\n[1] Tập dữ liệu tổng thể:")
    print(f"    - Tổng số mẫu: {X.shape[0]}, Số đặc trưng: {X.shape[1]}")
    print(f"    - Số ca Lành tính (0): {np.sum(y == 0)}")
    print(f"    - Số ca Ác tính (1):   {np.sum(y == 1)}")

    # Chia tập Train / Test
    stratify_param = y if CONFIG["use_stratify"] else None
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, 
        test_size=CONFIG["test_size"], 
        random_state=CONFIG["random_state"], 
        stratify=stratify_param
    )
    print(f"    - Tập huấn luyện (Train): {X_train.shape[0]} mẫu")
    print(f"    - Tập kiểm tra (Test):     {X_test.shape[0]} mẫu")

    if CONFIG["model_type"] == "LogisticRegression":
        scaler = StandardScaler()
        X_train_processed = scaler.fit_transform(X_train)
        X_test_processed = scaler.transform(X_test)
        model = LogisticRegression(random_state=CONFIG["random_state"])
        model_display_name = "Logistic Regression"
    else:
        X_train_processed = X_train
        X_test_processed = X_test
        model = DecisionTreeClassifier(
            max_depth=CONFIG["decision_tree_max_depth"], 
            random_state=CONFIG["random_state"]
        )
        model_display_name = f"Decision Tree (max_depth={CONFIG['decision_tree_max_depth']})"

    # BƯỚC 2: HUẤN LUYỆN VÀ ĐÁNH GIÁ TRÊN TẬP TEST
    print(f"\n[2] Đang huấn luyện mô hình {model_display_name}...")
    model.fit(X_train_processed, y_train)

    y_pred = model.predict(X_test_processed)
    
    # Lấy xác suất lớp 1 nếu mô hình hỗ trợ
    if hasattr(model, "predict_proba"):
        y_proba = model.predict_proba(X_test_processed)[:, 1]
    else:
        y_proba = None

    # 1. Ma trận nhầm lẫn (Confusion Matrix)
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()

    print("\n" + "=" * 68)
    print(" KẾT QUẢ ĐÁNH GIÁ TRÊN TẬP TEST")
    print("=" * 68)
    print(f"\n--- 1. MA TRẬN NHẦM LẪN (CONFUSION MATRIX) ---")
    print(cm)
    print(f"\nChi tiết 4 thành phần:")
    print(f"  * True Negative  (TN) [Lành tính -> Đoán đúng Lành tính]: {tn}")
    print(f"  * False Positive (FP) [Lành tính -> Đoán nhầm Ác tính  ]: {fp} (Báo động giả)")
    print(f"  * False Negative (FN) [Ác tính   -> Đoán nhầm Lành tính]: {fn} (BỎ SÓT BỆNH NHÂN)")
    print(f"  * True Positive  (TP) [Ác tính   -> Đoán đúng Ác tính  ]: {tp}")

    # 2. Báo cáo phân loại (Classification Report)
    print(f"\n--- 2. BẢNG PHÂN LOẠI (CLASSIFICATION REPORT) ---")
    rep_dict = classification_report(y_test, y_pred, target_names=target_names, output_dict=True)
    rep_str = classification_report(y_test, y_pred, target_names=target_names, digits=4)
    print(rep_str)

    # VẼ VÀ CẬP NHẬT BIỂU ĐỒ MA TRẬN NHẦM LẪN
    plt.figure(figsize=(7, 6))
    annot_labels = np.array([
        [f"TN = {tn}\n(Đúng: Lành tính)", f"FP = {fp}\n(Báo động giả)"],
        [f"FN = {fn}\n(BỎ SÓT BỆNH)", f"TP = {tp}\n(Đúng: Ác tính)"]
    ])
    sns.heatmap(
        cm, annot=annot_labels, fmt="", cmap="Blues", cbar=True,
        xticklabels=['Dự đoán: Lành tính (0)', 'Dự đoán: Ác tính (1)'],
        yticklabels=['Thực tế: Lành tính (0)', 'Thực tế: Ác tính (1)']
    )
    plt.title(f"Ma Trận Nhầm Lẫn - Mô hình {model_display_name}", fontsize=12, fontweight='bold', pad=12)
    plt.tight_layout()
    plt.savefig("confusion_matrix.png", dpi=300)
    plt.close()
    print("[+] Đã cập nhật ảnh biểu đồ: confusion_matrix.png")


if __name__ == "__main__":
    main()
