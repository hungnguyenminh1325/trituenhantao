"""
================================================================================
BÀI TẬP LỚN: PHÂN LOẠI LOÀI HOA IRIS BẰNG HỌC MÁY
Sinh viên thực hiện: Nguyễn Thanh Hùng - MSV: 20232139 - Lớp: DCCNTT.14.6
Mô hình 2: Cây quyết định (Decision Tree)
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
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score

def run_decision_tree():
    print("=" * 60)
    print("THỰC NGHIỆM MÔ HÌNH: CÂY QUYẾT ĐỊNH (DECISION TREE)")
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

    # 3. Huấn luyện mô hình Decision Tree cơ bản
    dt_clf = DecisionTreeClassifier(criterion='gini', random_state=42)
    dt_clf.fit(X_train, y_train)

    # 4. Dự đoán trên tập kiểm tra
    y_pred = dt_clf.predict(X_test)

    # 5. Đánh giá
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='macro')
    rec = recall_score(y_test, y_pred, average='macro')
    f1 = f1_score(y_test, y_pred, average='macro')

    print("\n--- KẾT QUẢ ĐÁNH GIÁ MÔ HÌNH DECISION TREE TRÊN TẬP KIỂM TRA ---")
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
    sns.heatmap(cm, annot=True, fmt='d', cmap='Greens',
                xticklabels=target_names, yticklabels=target_names)
    plt.title('Ma trận nhầm lẫn - Decision Tree', fontsize=12, fontweight='bold', pad=12)
    plt.xlabel('Nhãn dự đoán', fontsize=11)
    plt.ylabel('Nhãn thực tế', fontsize=11)
    plt.tight_layout()
    plt.savefig('images/decision_tree_confusion_matrix.png', dpi=300)
    plt.close()
    print("-> Đã lưu ảnh: images/decision_tree_confusion_matrix.png")

    # 7. Vẽ cấu trúc cây quyết định
    plt.figure(figsize=(12, 8))
    plot_tree(dt_clf, feature_names=feature_names, class_names=target_names,
              filled=True, rounded=True, fontsize=10)
    plt.title('Cấu trúc cây quyết định phân loại Iris', fontsize=14, fontweight='bold', pad=14)
    plt.tight_layout()
    plt.savefig('images/decision_tree_structure.png', dpi=300)
    plt.close()
    print("-> Đã lưu ảnh cấu trúc cây: images/decision_tree_structure.png")

    # 8. Khảo sát độ sâu cây max_depth từ 1 đến 10
    depths = range(1, 11)
    train_scores = []
    test_scores = []
    for d in depths:
        tree = DecisionTreeClassifier(max_depth=d, random_state=42)
        tree.fit(X_train, y_train)
        train_scores.append(accuracy_score(y_train, tree.predict(X_train)))
        test_scores.append(accuracy_score(y_test, tree.predict(X_test)))

    plt.figure(figsize=(7, 4.5))
    plt.plot(depths, train_scores, 'o-', label='Độ chính xác tập Train', color='blue', linewidth=2)
    plt.plot(depths, test_scores, 's--', label='Độ chính xác tập Test', color='crimson', linewidth=2)
    plt.title('Ảnh hưởng của độ sâu (max_depth) đến hiệu năng Cây quyết định', fontsize=12, fontweight='bold')
    plt.xlabel('Độ sâu tối đa (max_depth)', fontsize=11)
    plt.ylabel('Độ chính xác (Accuracy)', fontsize=11)
    plt.xticks(depths)
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.legend(fontsize=10)
    plt.tight_layout()
    plt.savefig('images/decision_tree_depth_tuning.png', dpi=300)
    plt.close()
    print("-> Đã lưu ảnh: images/decision_tree_depth_tuning.png")

    # 9. Tối ưu siêu tham số bằng GridSearchCV
    param_grid = {
        'criterion': ['gini', 'entropy'],
        'max_depth': [2, 3, 4, 5, 6, None],
        'min_samples_split': [2, 3, 5],
        'min_samples_leaf': [1, 2, 4]
    }
    grid = GridSearchCV(DecisionTreeClassifier(random_state=42), param_grid, cv=5, scoring='accuracy')
    grid.fit(X_train, y_train)

    print("\n--- KẾT QUẢ TỐI ƯU THAM SỐ DECISION TREE (GRID SEARCH CV) ---")
    print("Tham số tối ưu:", grid.best_params_)
    print(f"Điểm số Cross-Validation tốt nhất: {grid.best_score_:.4f}")

    best_dt = grid.best_estimator_
    best_pred = best_dt.predict(X_test)
    best_acc = accuracy_score(y_test, best_pred)
    print(f"Độ chính xác trên tập Test sau khi tối ưu: {best_acc:.4f} ({best_acc*100:.2f}%)")

    return {
        'model_name': 'Decision Tree',
        'accuracy': acc,
        'precision': prec,
        'recall': rec,
        'f1': f1,
        'confusion_matrix': cm,
        'best_params': grid.best_params_,
        'best_accuracy': best_acc
    }

if __name__ == '__main__':
    run_decision_tree()
