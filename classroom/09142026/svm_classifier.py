"""
================================================================================
BÀI TẬP LỚN: PHÂN LOẠI LOÀI HOA IRIS BẰNG HỌC MÁY
Sinh viên thực hiện: Nguyễn Thanh Hùng - MSV: 20232139 - Lớp: DCCNTT.14.6
Mô hình 1: Support Vector Machine (SVM)
================================================================================
"""

import os
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score

def run_svm():
    print("=" * 60)
    print("THỰC NGHIỆM MÔ HÌNH: SUPPORT VECTOR MACHINE (SVM)")
    print("=" * 60)

    # 1. Tải tập dữ liệu Iris
    iris = load_iris()
    X = iris.data
    y = iris.target
    target_names = iris.target_names
    feature_names = iris.feature_names

    # 2. Phân chia dữ liệu theo phương pháp Hold-out 80:20 (Stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    print(f"Tổng số mẫu tập huấn luyện (Train): {len(X_train)}")
    print(f"Tổng số mẫu tập kiểm tra (Test):     {len(X_test)}")

    # 3. Huấn luyện mô hình SVM cơ bản (RBF kernel, C=1.0)
    svm_clf = SVC(kernel='rbf', C=1.0, gamma='scale', random_state=42)
    svm_clf.fit(X_train, y_train)

    # 4. Dự đoán trên tập kiểm tra
    y_pred = svm_clf.predict(X_test)

    # 5. Đánh giá các chỉ số
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='macro')
    rec = recall_score(y_test, y_pred, average='macro')
    f1 = f1_score(y_test, y_pred, average='macro')

    print("\n--- KẾT QUẢ ĐÁNH GIÁ MÔ HÌNH SVM TRÊN TẬP KIỂM TRA ---")
    print(f"Accuracy  : {acc:.4f} ({acc*100:.2f}%)")
    print(f"Precision : {prec:.4f} ({prec*100:.2f}%)")
    print(f"Recall    : {rec:.4f} ({rec*100:.2f}%)")
    print(f"F1-Score  : {f1:.4f} ({f1*100:.2f}%)")

    print("\nBáo cáo phân loại chi tiết (Classification Report):")
    print(classification_report(y_test, y_pred, target_names=target_names))

    cm = confusion_matrix(y_test, y_pred)
    print("Ma trận nhầm lẫn (Confusion Matrix):")
    print(cm)

    # 6. Vẽ và lưu Ma trận nhầm lẫn
    os.makedirs('images', exist_ok=True)
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=target_names, yticklabels=target_names)
    plt.title('Ma trận nhầm lẫn - SVM (Support Vector Machine)', fontsize=12, fontweight='bold', pad=12)
    plt.xlabel('Nhãn dự đoán', fontsize=11)
    plt.ylabel('Nhãn thực tế', fontsize=11)
    plt.tight_layout()
    plt.savefig('images/svm_confusion_matrix.png', dpi=300)
    plt.close()
    print("-> Đã lưu ảnh: images/svm_confusion_matrix.png")

    # 7. Khảo sát tối ưu tham số (GridSearchCV cho C và gamma, kernel)
    param_grid = {
        'C': [0.1, 1, 10, 100],
        'gamma': [1, 0.1, 0.01, 0.001, 'scale'],
        'kernel': ['linear', 'rbf', 'poly']
    }
    grid = GridSearchCV(SVC(random_state=42), param_grid, cv=5, scoring='accuracy')
    grid.fit(X_train, y_train)

    print("\n--- KẾT QUẢ TỐI ƯU THAM SỐ SVM (GRID SEARCH CV) ---")
    print("Tham số tối ưu:", grid.best_params_)
    print(f"Điểm số Cross-Validation tốt nhất: {grid.best_score_:.4f}")

    best_svm = grid.best_estimator_
    best_pred = best_svm.predict(X_test)
    best_acc = accuracy_score(y_test, best_pred)
    print(f"Độ chính xác trên tập Test sau khi tối ưu: {best_acc:.4f} ({best_acc*100:.2f}%)")

    return {
        'model_name': 'Support Vector Machine (SVM)',
        'accuracy': acc,
        'precision': prec,
        'recall': rec,
        'f1': f1,
        'confusion_matrix': cm,
        'best_params': grid.best_params_,
        'best_accuracy': best_acc
    }

if __name__ == '__main__':
    run_svm()
