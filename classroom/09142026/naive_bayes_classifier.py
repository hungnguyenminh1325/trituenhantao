"""
================================================================================
BÀI TẬP LỚN: PHÂN LOẠI LOÀI HOA IRIS BẰNG HỌC MÁY
Sinh viên thực hiện: Nguyễn Thanh Hùng - MSV: 20232139 - Lớp: DCCNTT.14.6
Mô hình 3: Naive Bayes (Gaussian Naive Bayes)
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
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score

def run_naive_bayes():
    print("=" * 60)
    print("THỰC NGHIỆM MÔ HÌNH: NAIVE BAYES (GAUSSIAN NAIVE BAYES)")
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

    # 3. Huấn luyện mô hình Gaussian Naive Bayes cơ bản
    nb_clf = GaussianNB()
    nb_clf.fit(X_train, y_train)

    # 4. Dự đoán trên tập kiểm tra
    y_pred = nb_clf.predict(X_test)

    # 5. Đánh giá
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='macro')
    rec = recall_score(y_test, y_pred, average='macro')
    f1 = f1_score(y_test, y_pred, average='macro')

    print("\n--- KẾT QUẢ ĐÁNH GIÁ MÔ HÌNH NAIVE BAYES TRÊN TẬP KIỂM TRA ---")
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
    sns.heatmap(cm, annot=True, fmt='d', cmap='Oranges',
                xticklabels=target_names, yticklabels=target_names)
    plt.title('Ma trận nhầm lẫn - Naive Bayes', fontsize=12, fontweight='bold', pad=12)
    plt.xlabel('Nhãn dự đoán', fontsize=11)
    plt.ylabel('Nhãn thực tế', fontsize=11)
    plt.tight_layout()
    plt.savefig('images/naive_bayes_confusion_matrix.png', dpi=300)
    plt.close()
    print("-> Đã lưu ảnh: images/naive_bayes_confusion_matrix.png")

    # 7. Vẽ phân phối xác suất Gaussian theo từng đặc trưng cho 3 loài hoa
    fig, axes = plt.subplots(2, 2, figsize=(11, 8))
    axes = axes.ravel()
    colors = ['navy', 'darkgreen', 'darkred']

    for i in range(4):
        ax = axes[i]
        for class_idx, class_name in enumerate(target_names):
            vals = X_train[y_train == class_idx, i]
            mean = np.mean(vals)
            std = np.std(vals)
            x_axis = np.linspace(mean - 3.5*std, mean + 3.5*std, 150)
            p = (1 / (np.sqrt(2 * np.pi) * std)) * np.exp(-0.5 * ((x_axis - mean) / std) ** 2)
            ax.plot(x_axis, p, label=f'{class_name} (μ={mean:.2f})', color=colors[class_idx], lw=2)
            ax.fill_between(x_axis, p, alpha=0.15, color=colors[class_idx])
        ax.set_title(f'Phân phối Gauss: {feature_names[i]}', fontsize=11, fontweight='bold')
        ax.set_xlabel('Giá trị đo (cm)')
        ax.set_ylabel('Mật độ xác suất')
        ax.grid(True, linestyle='--', alpha=0.5)
        ax.legend(fontsize=8)

    plt.tight_layout()
    plt.savefig('images/naive_bayes_distribution.png', dpi=300)
    plt.close()
    print("-> Đã lưu ảnh phân phối: images/naive_bayes_distribution.png")

    # 8. Tối ưu tham số var_smoothing
    param_grid = {'var_smoothing': np.logspace(0, -9, num=100)}
    grid = GridSearchCV(GaussianNB(), param_grid, cv=5, scoring='accuracy')
    grid.fit(X_train, y_train)

    print("\n--- KẾT QUẢ TỐI ƯU THAM SỐ NAIVE BAYES (GRID SEARCH CV) ---")
    print("Tham số tối ưu:", grid.best_params_)
    print(f"Điểm số Cross-Validation tốt nhất: {grid.best_score_:.4f}")

    best_nb = grid.best_estimator_
    best_pred = best_nb.predict(X_test)
    best_acc = accuracy_score(y_test, best_pred)
    print(f"Độ chính xác trên tập Test sau khi tối ưu: {best_acc:.4f} ({best_acc*100:.2f}%)")

    return {
        'model_name': 'Naive Bayes (Gaussian)',
        'accuracy': acc,
        'precision': prec,
        'recall': rec,
        'f1': f1,
        'confusion_matrix': cm,
        'best_params': grid.best_params_,
        'best_accuracy': best_acc
    }

if __name__ == '__main__':
    run_naive_bayes()
