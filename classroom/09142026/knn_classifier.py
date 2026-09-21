"""
================================================================================
BÀI TẬP LỚN: PHÂN LOẠI LOÀI HOA IRIS BẰNG HỌC MÁY
Sinh viên thực hiện: Nguyễn Thanh Hùng - MSV: 20232139 - Lớp: DCCNTT.14.6
Mô hình 4: K-Nearest Neighbors (KNN)
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
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score

def run_knn():
    print("=" * 60)
    print("THỰC NGHIỆM MÔ HÌNH: K-NEAREST NEIGHBORS (KNN)")
    print("=" * 60)

    # 1. Tải tập dữ liệu Iris
    iris = load_iris()
    X = iris.data
    y = iris.target
    target_names = iris.target_names
    feature_names = iris.feature_names

    # 2. Phân chia dữ liệu theo Hold-out 80:20 (Stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    # 3. Huấn luyện mô hình KNN cơ bản (mặc định n_neighbors=5, metric='minkowski')
    knn_clf = KNeighborsClassifier(n_neighbors=5)
    knn_clf.fit(X_train, y_train)

    # 4. Dự đoán trên tập kiểm tra
    y_pred = knn_clf.predict(X_test)

    # 5. Đánh giá
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='macro')
    rec = recall_score(y_test, y_pred, average='macro')
    f1 = f1_score(y_test, y_pred, average='macro')

    print("\n--- KẾT QUẢ ĐÁNH GIÁ MÔ HÌNH KNN TRÊN TẬP KIỂM TRA ---")
    print(f"Accuracy  : {acc:.4f} ({acc*100:.2f}%)")
    print(f"Precision : {prec:.4f} ({prec*100:.2f}%)")
    print(f"Recall    : {rec:.4f} ({rec*100:.2f}%)")
    print(f"F1-Score  : {f1:.4f} ({f1*100:.2f}%)")

    print("\nBáo cáo phân loại chi tiết (Classification Report):")
    print(classification_report(y_test, y_pred, target_names=target_names))

    cm = confusion_matrix(y_test, y_pred)
    print("Ma trận nhầm lẫn (Confusion Matrix):")
    print(cm)

    os.makedirs('images', exist_ok=True)

    # 6. Vẽ và lưu Ma trận nhầm lẫn
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Purples',
                xticklabels=target_names, yticklabels=target_names)
    plt.title('Ma trận nhầm lẫn - K-Nearest Neighbors (KNN)', fontsize=12, fontweight='bold', pad=12)
    plt.xlabel('Nhãn dự đoán', fontsize=11)
    plt.ylabel('Nhãn thực tế', fontsize=11)
    plt.tight_layout()
    plt.savefig('images/knn_confusion_matrix.png', dpi=300)
    plt.close()
    print("-> Đã lưu ảnh: images/knn_confusion_matrix.png")

    # 7. Khảo sát giá trị K từ 1 đến 25
    k_range = range(1, 26)
    k_train_scores = []
    k_test_scores = []

    for k in k_range:
        clf = KNeighborsClassifier(n_neighbors=k)
        clf.fit(X_train, y_train)
        k_train_scores.append(accuracy_score(y_train, clf.predict(X_train)))
        k_test_scores.append(accuracy_score(y_test, clf.predict(X_test)))

    plt.figure(figsize=(8, 5))
    plt.plot(k_range, k_train_scores, 'o-', label='Độ chính xác Train', color='indigo', linewidth=2)
    plt.plot(k_range, k_test_scores, 's--', label='Độ chính xác Test', color='darkorange', linewidth=2)
    plt.title('Ảnh hưởng của tham số K đến độ chính xác KNN', fontsize=13, fontweight='bold')
    plt.xlabel('Số lượng láng giềng gần nhất (K)', fontsize=11)
    plt.ylabel('Độ chính xác (Accuracy)', fontsize=11)
    plt.xticks(range(1, 26, 2))
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.legend(fontsize=10)
    plt.tight_layout()
    plt.savefig('images/knn_accuracy_vs_k.png', dpi=300)
    plt.close()
    print("-> Đã lưu ảnh khảo sát K: images/knn_accuracy_vs_k.png")

    # 8. Tối ưu siêu tham số bằng GridSearchCV
    param_grid = {
        'n_neighbors': list(range(1, 21)),
        'weights': ['uniform', 'distance'],
        'metric': ['euclidean', 'manhattan', 'minkowski']
    }
    grid = GridSearchCV(KNeighborsClassifier(), param_grid, cv=5, scoring='accuracy')
    grid.fit(X_train, y_train)

    print("\n--- KẾT QUẢ TỐI ƯU THAM SỐ KNN (GRID SEARCH CV) ---")
    print("Tham số tối ưu:", grid.best_params_)
    print(f"Điểm số Cross-Validation tốt nhất: {grid.best_score_:.4f}")

    best_knn = grid.best_estimator_
    best_pred = best_knn.predict(X_test)
    best_acc = accuracy_score(y_test, best_pred)
    print(f"Độ chính xác trên tập Test sau khi tối ưu: {best_acc:.4f} ({best_acc*100:.2f}%)")

    return {
        'model_name': 'K-Nearest Neighbors (KNN)',
        'accuracy': acc,
        'precision': prec,
        'recall': rec,
        'f1': f1,
        'confusion_matrix': cm,
        'best_params': grid.best_params_,
        'best_accuracy': best_acc
    }

if __name__ == '__main__':
    run_knn()
