"""
================================================================================
BÀI TẬP LỚN: PHÂN LOẠI LOÀI HOA IRIS BẰNG HỌC MÁY
Sinh viên thực hiện: Nguyễn Thanh Hùng - MSV: 20232139 - Lớp: DCCNTT.14.6
File điều phối tổng thể: main_experiment.py
================================================================================
"""

import os
import sys
import time
import json

# Đảm bảo in tiếng Việt trên console Windows không bị lỗi bảng mã charmap
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

# Cấu hình hiển thị matplotlib
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['axes.edgecolor'] = '#333333'
plt.rcParams['axes.linewidth'] = 0.8

def run_all_experiments():
    print("=" * 70)
    print("CHƯƠNG TRÌNH THỰC NGHIỆM SO SÁNH 4 MÔ HÌNH HỌC MÁY TRÊN TẬP DỮ LIỆU IRIS")
    print("Sinh viên: Nguyễn Thanh Hùng - MSV: 20232139")
    print("=" * 70)

    os.makedirs('images', exist_ok=True)

    # 1. Tải dữ liệu Iris
    iris = load_iris()
    X = iris.data
    y = iris.target
    feature_names = iris.feature_names
    target_names = iris.target_names

    # 2. Chia tập dữ liệu Hold-out 80:20 Stratified theo đúng Chương 2
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    models = {
        'SVM': SVC(kernel='rbf', C=1.0, gamma='scale', random_state=42),
        'Decision Tree': DecisionTreeClassifier(criterion='gini', random_state=42),
        'Naive Bayes': GaussianNB(),
        'KNN': KNeighborsClassifier(n_neighbors=5)
    }

    results = {}
    detailed_reports = {}

    print(f"\n[1] BẮT ĐẦU HUẤN LUYỆN VÀ ĐÁNH GIÁ 4 MÔ HÌNH...")
    for name, model in models.items():
        t0 = time.time()
        model.fit(X_train, y_train)
        fit_time = (time.time() - t0) * 1000 # ms

        y_pred = model.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average='macro')
        rec = recall_score(y_test, y_pred, average='macro')
        f1 = f1_score(y_test, y_pred, average='macro')
        cm = confusion_matrix(y_test, y_pred)
        cr = classification_report(y_test, y_pred, target_names=target_names, output_dict=True)

        results[name] = {
            'accuracy': float(acc),
            'precision': float(prec),
            'recall': float(rec),
            'f1': float(f1),
            'fit_time_ms': float(fit_time),
            'confusion_matrix': cm.tolist()
        }
        detailed_reports[name] = cr

        print(f"-> {name:15s} | Acc: {acc:.4f} | Prec: {prec:.4f} | Rec: {rec:.4f} | F1: {f1:.4f} | Time: {fit_time:.2f}ms")

    # 3. Tạo bảng DataFrame so sánh
    df_compare = pd.DataFrame(results).T[['accuracy', 'precision', 'recall', 'f1', 'fit_time_ms']]
    df_compare.columns = ['Accuracy', 'Precision (Macro)', 'Recall (Macro)', 'F1-Score (Macro)', 'Train Time (ms)']
    print("\n[BẢNG TỔNG HỢP SO SÁNH HIỆU NĂNG 4 MÔ HÌNH]")
    print(df_compare.to_string())

    # 4. Vẽ biểu đồ cột so sánh trực quan
    fig, ax = plt.subplots(figsize=(10, 6))
    metrics = ['Accuracy', 'Precision', 'Recall', 'F1-Score']
    x = np.arange(len(metrics))
    width = 0.18

    colors = ['#2b5c8f', '#2ca02c', '#ff7f0e', '#9467bd']

    for i, (name, res) in enumerate(results.items()):
        vals = [res['accuracy'], res['precision'], res['recall'], res['f1']]
        offset = (i - 1.5) * width
        bars = ax.bar(x + offset, vals, width, label=name, color=colors[i], edgecolor='black', linewidth=0.8)
        # Thêm nhãn giá trị trên đầu cột
        for bar in bars:
            height = bar.get_height()
            ax.annotate(f'{height:.2f}',
                        xy=(bar.get_x() + bar.get_width() / 2, height),
                        xytext=(0, 3), textcoords="offset points",
                        ha='center', va='bottom', fontsize=8, fontweight='bold')

    ax.set_title('So sánh hiệu năng 4 mô hình học máy trên tập dữ liệu kiểm tra Iris', fontsize=13, fontweight='bold', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(metrics, fontsize=11, fontweight='semibold')
    ax.set_ylabel('Điểm số (Thang đo 0 - 1.0)', fontsize=11)
    ax.set_ylim(0.85, 1.05)
    ax.grid(axis='y', linestyle='--', alpha=0.5)
    ax.legend(title='Mô hình', title_fontsize='10', fontsize=10, loc='lower right')
    plt.tight_layout()
    plt.savefig('images/model_comparison_bar.png', dpi=300)
    plt.close()
    print("-> Đã lưu biểu đồ so sánh: images/model_comparison_bar.png")

    # 5. Vẽ ranh giới quyết định (Decision Boundary) trên 2 đặc trưng Petal Length và Petal Width
    print("\n[2] VẼ RANH GIỚI QUYẾT ĐỊNH TRÊN 2 ĐẶC TRƯNG CÁNH HOA (PETAL)...")
    X_2d = X[:, [2, 3]] # Petal Length, Petal Width
    X_train_2d, X_test_2d, y_train_2d, y_test_2d = train_test_split(
        X_2d, y, test_size=0.2, random_state=42, stratify=y
    )

    models_2d = {
        'SVM (RBF)': SVC(kernel='rbf', C=1.0, random_state=42),
        'Decision Tree': DecisionTreeClassifier(max_depth=3, random_state=42),
        'Naive Bayes': GaussianNB(),
        'KNN (K=5)': KNeighborsClassifier(n_neighbors=5)
    }

    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    axes = axes.ravel()

    # Tạo lưới điểm để vẽ ranh giới
    x_min, x_max = X_2d[:, 0].min() - 0.5, X_2d[:, 0].max() + 0.5
    y_min, y_max = X_2d[:, 1].min() - 0.5, X_2d[:, 1].max() + 0.5
    xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.02),
                         np.arange(y_min, y_max, 0.02))

    cmap_light = ['#AAAAFF', '#AAFFAA', '#FFAAAA']
    cmap_bold = ['#0000AA', '#00AA00', '#AA0000']

    for idx, (name, model_2d) in enumerate(models_2d.items()):
        ax = axes[idx]
        model_2d.fit(X_train_2d, y_train_2d)
        Z = model_2d.predict(np.c_[xx.ravel(), yy.ravel()])
        Z = Z.reshape(xx.shape)

        ax.contourf(xx, yy, Z, alpha=0.35, levels=[-0.5, 0.5, 1.5, 2.5], colors=cmap_light)
        
        # Vẽ các điểm kiểm tra
        for class_val, c_name, color in zip([0, 1, 2], target_names, cmap_bold):
            idx_pts = np.where(y_test_2d == class_val)
            ax.scatter(X_test_2d[idx_pts, 0], X_test_2d[idx_pts, 1],
                       c=color, label=f'Test: {c_name}', edgecolors='k', s=60)

        ax.set_title(f'Ranh giới phân loại - {name}', fontsize=12, fontweight='bold')
        ax.set_xlabel('Petal Length (cm)', fontsize=10)
        ax.set_ylabel('Petal Width (cm)', fontsize=10)
        ax.grid(True, linestyle=':', alpha=0.5)
        if idx == 0:
            ax.legend(loc='upper left', fontsize=8)

    plt.tight_layout()
    plt.savefig('images/decision_boundaries.png', dpi=300)
    plt.close()
    print("-> Đã lưu ảnh ranh giới quyết định: images/decision_boundaries.png")

    # 6. Tối ưu tham số cho từng mô hình và vẽ biểu đồ so sánh trước/sau tối ưu
    print("\n[3] TIẾN HÀNH TỐI ƯU SIÊU THAM SỐ (HYPERPARAMETER TUNING)...")
    param_grids = {
        'SVM': (SVC(random_state=42), {'C': [0.1, 1, 10, 100], 'gamma': [1, 0.1, 0.01, 'scale'], 'kernel': ['linear', 'rbf']}),
        'Decision Tree': (DecisionTreeClassifier(random_state=42), {'max_depth': [2, 3, 4, 5, None], 'criterion': ['gini', 'entropy'], 'min_samples_split': [2, 4]}),
        'Naive Bayes': (GaussianNB(), {'var_smoothing': np.logspace(0, -9, 20)}),
        'KNN': (KNeighborsClassifier(), {'n_neighbors': list(range(1, 16)), 'weights': ['uniform', 'distance']})
    }

    opt_results = {}
    for name, (estimator, p_grid) in param_grids.items():
        grid = GridSearchCV(estimator, p_grid, cv=5, scoring='accuracy')
        grid.fit(X_train, y_train)
        best_est = grid.best_estimator_
        y_opt_pred = best_est.predict(X_test)
        opt_acc = accuracy_score(y_test, y_opt_pred)
        opt_f1 = f1_score(y_test, y_opt_pred, average='macro')

        opt_results[name] = {
            'best_params': {k: str(v) for k, v in grid.best_params_.items()},
            'cv_best_score': float(grid.best_score_),
            'test_accuracy_before': results[name]['accuracy'],
            'test_accuracy_after': float(opt_acc),
            'test_f1_after': float(opt_f1)
        }
        print(f"-> {name:15s} | Params: {grid.best_params_} | CV Score: {grid.best_score_:.4f} | Test Acc: {opt_acc:.4f}")

    # 7. Vẽ biểu đồ so sánh Trước vs Sau Tối ưu
    fig, ax = plt.subplots(figsize=(8, 5))
    names = list(opt_results.keys())
    x = np.arange(len(names))
    width = 0.35

    before_acc = [opt_results[n]['test_accuracy_before'] * 100 for n in names]
    after_acc = [opt_results[n]['test_accuracy_after'] * 100 for n in names]

    bars1 = ax.bar(x - width/2, before_acc, width, label='Trước tối ưu (Mặc định)', color='#5B9BD5', edgecolor='black')
    bars2 = ax.bar(x + width/2, after_acc, width, label='Sau tối ưu (GridSearchCV)', color='#ED7D31', edgecolor='black')

    for bars in [bars1, bars2]:
        for bar in bars:
            height = bar.get_height()
            ax.annotate(f'{height:.1f}%',
                        xy=(bar.get_x() + bar.get_width() / 2, height),
                        xytext=(0, 3), textcoords="offset points",
                        ha='center', va='bottom', fontsize=9, fontweight='bold')

    ax.set_title('Độ chính xác các mô hình trước và sau khi tối ưu tham số', fontsize=12, fontweight='bold', pad=12)
    ax.set_xticks(x)
    ax.set_xticklabels(names, fontsize=10, fontweight='semibold')
    ax.set_ylabel('Độ chính xác (%)', fontsize=11)
    ax.set_ylim(80, 108)
    ax.grid(axis='y', linestyle='--', alpha=0.5)
    ax.legend(fontsize=10)
    plt.tight_layout()
    plt.savefig('images/optimization_comparison.png', dpi=300)
    plt.close()
    print("-> Đã lưu ảnh so sánh tối ưu: images/optimization_comparison.png")

    # 8. Lưu toàn bộ số liệu vào JSON để phục vụ viết báo cáo Word
    final_output = {
        'results': results,
        'detailed_reports': detailed_reports,
        'optimization': opt_results
    }
    with open('experiment_results.json', 'w', encoding='utf-8') as f:
        json.dump(final_output, f, ensure_ascii=False, indent=4)
    print("\n-> Đã lưu kết quả thực nghiệm ra file: experiment_results.json")
    print("=" * 70)
    print("HOÀN TẤT TOÀN BỘ THỰC NGHIỆM THÀNH CÔNG!")
    print("=" * 70)

if __name__ == '__main__':
    run_all_experiments()
