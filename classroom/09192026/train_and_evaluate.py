import os
import sys
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.metrics import (
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    r2_score,
    mean_squared_error,
    mean_absolute_error,
    classification_report
)

# Cấu hình hiển thị đồ họa
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['axes.unicode_minus'] = False
sns.set_theme(style="whitegrid")

def main():
    print("=== BẮT ĐẦU THỰC NGHIỆM ĐÁNH GIÁ MÔ HÌNH HỌC MÁY ===")
    
    # 1. Tải và tiền xử lý dữ liệu
    df = pd.read_csv('Real_Estate.csv')
    print(f"Kích thước tập dữ liệu: {df.shape[0]} dòng, {df.shape[1]} cột")
    
    # Đổi tên cột cho rõ nghĩa
    col_mapping = {
        'No': 'ID',
        'X1 transaction date': 'Transaction_Date',
        'X2 house age': 'House_Age',
        'X3 distance to the nearest MRT station': 'Distance_MRT',
        'X4 number of convenience stores': 'Num_Convenience_Stores',
        'X5 latitude': 'Latitude',
        'X6 longitude': 'Longitude',
        'Y house price of unit area': 'House_Price'
    }
    df = df.rename(columns=col_mapping)
    
    # Bỏ cột ID
    if 'ID' in df.columns:
        df = df.drop(columns=['ID'])
        
    features = ['Transaction_Date', 'House_Age', 'Distance_MRT', 'Num_Convenience_Stores', 'Latitude', 'Longitude']
    X = df[features]
    y_reg = df['House_Price']
    
    # Phân loại phân khúc giá nhà theo ngưỡng trung vị (Median)
    median_price = y_reg.median()
    print(f"Ngưỡng trung vị phân khúc giá nhà (Median): {median_price:.2f} (10.000 NTD/Ping)")
    
    # 0: Giá bình dân / Thấp (<= Median)
    # 1: Giá cao cấp (> Median)
    y_clf = (y_reg > median_price).astype(int)
    print(f"Phân phối nhãn phân loại: Lớp 0 = {(y_clf == 0).sum()}, Lớp 1 = {(y_clf == 1).sum()}")
    
    # 2. Thực nghiệm lặp 10 lần với các bộ chia Train/Test 80/20 khác nhau
    seeds = [12, 42, 100, 2024, 7, 88, 555, 999, 1234, 7777]
    
    results_lr = []
    results_dt = []
    results_reg_lr = []
    results_reg_dt = []
    
    # Biến lưu trữ cho lần chạy đầu tiên (Seed 42) để minh họa ma trận nhầm lẫn & bảng dự báo
    rep_run_data = {}
    
    for i, seed in enumerate(seeds, 1):
        # Chia train/test 80/20 đồng bộ cho cả phân loại và hồi quy
        X_train, X_test, y_train, y_test, y_train_reg, y_test_reg = train_test_split(
            X, y_clf, y_reg, test_size=0.2, random_state=seed, stratify=y_clf
        )
        
        # Chuẩn hóa dữ liệu cho Logistic Regression
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Mô hình 1: Logistic Regression
        lr = LogisticRegression(max_iter=1000, random_state=seed)
        lr.fit(X_train_scaled, y_train)
        y_pred_lr = lr.predict(X_test_scaled)
        y_prob_lr = lr.predict_proba(X_test_scaled)[:, 1]
        
        acc_lr = accuracy_score(y_test, y_pred_lr)
        prec_lr = precision_score(y_test, y_pred_lr, zero_division=0)
        rec_lr = recall_score(y_test, y_pred_lr, zero_division=0)
        f1_lr = f1_score(y_test, y_pred_lr, zero_division=0)
        
        results_lr.append({
            'Lần chạy': i,
            'Seed': seed,
            'Accuracy': acc_lr,
            'Precision': prec_lr,
            'Recall': rec_lr,
            'F1_Score': f1_lr
        })
        
        # Mô hình 2: Decision Tree Classifier
        dt = DecisionTreeClassifier(max_depth=4, random_state=seed)
        dt.fit(X_train, y_train)
        y_pred_dt = dt.predict(X_test)
        
        acc_dt = accuracy_score(y_test, y_pred_dt)
        prec_dt = precision_score(y_test, y_pred_dt, zero_division=0)
        rec_dt = recall_score(y_test, y_pred_dt, zero_division=0)
        f1_dt = f1_score(y_test, y_pred_dt, zero_division=0)
        
        results_dt.append({
            'Lần chạy': i,
            'Seed': seed,
            'Accuracy': acc_dt,
            'Precision': prec_dt,
            'Recall': rec_dt,
            'F1_Score': f1_dt
        })
        
        # Mô hình hồi quy Linear Regression
        reg_lr = LinearRegression()
        reg_lr.fit(X_train_scaled, y_train_reg)
        y_pred_reg_lr = reg_lr.predict(X_test_scaled)
        r2_lr = r2_score(y_test_reg, y_pred_reg_lr)
        rmse_lr = np.sqrt(mean_squared_error(y_test_reg, y_pred_reg_lr))
        mae_lr = mean_absolute_error(y_test_reg, y_pred_reg_lr)
        results_reg_lr.append({'Lần chạy': i, 'R2': r2_lr, 'RMSE': rmse_lr, 'MAE': mae_lr})
        
        # Mô hình hồi quy Decision Tree Regressor
        reg_dt = DecisionTreeRegressor(max_depth=4, random_state=seed)
        reg_dt.fit(X_train, y_train_reg)
        y_pred_reg_dt = reg_dt.predict(X_test)
        r2_dt = r2_score(y_test_reg, y_pred_reg_dt)
        rmse_dt = np.sqrt(mean_squared_error(y_test_reg, y_pred_reg_dt))
        mae_dt = mean_absolute_error(y_test_reg, y_pred_reg_dt)
        results_reg_dt.append({'Lần chạy': i, 'R2': r2_dt, 'RMSE': rmse_dt, 'MAE': mae_dt})
        
        # Lưu kết quả của lần chạy tiêu biểu (seed 42)
        if seed == 42:
            rep_run_data = {
                'X_test': X_test.copy(),
                'y_test': y_test.copy(),
                'y_test_reg': y_test_reg.copy(),
                'y_pred_lr': y_pred_lr.copy(),
                'y_prob_lr': y_prob_lr.copy(),
                'y_pred_dt': y_pred_dt.copy(),
                'y_pred_reg_lr': y_pred_reg_lr.copy(),
                'cm_lr': confusion_matrix(y_test, y_pred_lr),
                'cm_dt': confusion_matrix(y_test, y_pred_dt),
                'feature_names': features,
                'lr_coefs': lr.coef_[0],
                'dt_importances': dt.feature_importances_
            }

    df_lr = pd.DataFrame(results_lr)
    df_dt = pd.DataFrame(results_dt)
    df_reg_lr = pd.DataFrame(results_reg_lr)
    
    print("\n--- KẾT QUẢ ĐỘ CHÍNH XÁC LOGISTIC REGRESSION (10 LẦN) ---")
    print(df_lr[['Lần chạy', 'Seed', 'Accuracy', 'Precision', 'Recall', 'F1_Score']].to_string(index=False))
    print(f"Trung bình Accuracy: {df_lr['Accuracy'].mean():.4f} +/- {df_lr['Accuracy'].std():.4f}")
    
    print("\n--- KẾT QUẢ ĐỘ CHÍNH XÁC DECISION TREE (10 LẦN) ---")
    print(df_dt[['Lần chạy', 'Seed', 'Accuracy', 'Precision', 'Recall', 'F1_Score']].to_string(index=False))
    print(f"Trung bình Accuracy: {df_dt['Accuracy'].mean():.4f} +/- {df_dt['Accuracy'].std():.4f}")

    # Tạo bảng dự báo chi tiết (Sample 15 mẫu tập Test)
    sample_test = rep_run_data['X_test'].copy().reset_index(drop=True)
    sample_test['Gia_Thuc_Te'] = rep_run_data['y_test_reg'].values
    sample_test['Nhan_Thuc_Te'] = rep_run_data['y_test'].values
    sample_test['Du_Bao_LR'] = rep_run_data['y_pred_lr']
    sample_test['Xac_Suat_Gia_Cao'] = np.round(rep_run_data['y_prob_lr'] * 100, 1)
    sample_test['Du_Bao_DT'] = rep_run_data['y_pred_dt']
    sample_test['Ket_Qua_LR'] = np.where(sample_test['Nhan_Thuc_Te'] == sample_test['Du_Bao_LR'], 'Chính xác', 'Sai sót')
    sample_test_15 = sample_test.head(15)
    sample_test_15.to_csv('sample_predictions.csv', index=False)
    print("\nĐã lưu 15 mẫu dự báo tập Test vào 'sample_predictions.csv'")

    # Lưu thống kê 10 lần chạy
    df_lr.to_csv('results_logistic_regression.csv', index=False)
    df_dt.to_csv('results_decision_tree.csv', index=False)
    
    # 3. VẼ VÀ XUẤT CÁC BIỂU ĐỒ CHẤT LƯỢNG CAO
    os.makedirs('images', exist_ok=True)
    
    # Biểu đồ 1: Ma trận nhầm lẫn (Confusion Matrix)
    fig, axes = plt.subplots(1, 2, figsize=(13, 5.5))
    cm_lr = rep_run_data['cm_lr']
    cm_dt = rep_run_data['cm_dt']
    labels = ['Giá Thấp/TB (0)', 'Giá Cao (1)']
    
    # Heatmap LR
    sns.heatmap(cm_lr, annot=True, fmt='d', cmap='Blues', ax=axes[0],
                xticklabels=labels, yticklabels=labels, cbar=False,
                annot_kws={'size': 14, 'weight': 'bold'})
    axes[0].set_title(f"Logistic Regression\n(Accuracy: {accuracy_score(rep_run_data['y_test'], rep_run_data['y_pred_lr'])*100:.1f}%)", fontsize=13, fontweight='bold', pad=10)
    axes[0].set_xlabel("Nhãn Dự Báo (Predicted Label)", fontsize=11, fontweight='bold')
    axes[0].set_ylabel("Nhãn Thực Tế (True Label)", fontsize=11, fontweight='bold')
    
    # Thêm chú thích TP, TN, FP, FN cho LR
    tn, fp, fn, tp = cm_lr.ravel()
    axes[0].text(0.5, 0.25, f'TN = {tn}', ha='center', va='center', color='black', fontsize=10)
    axes[0].text(1.5, 0.25, f'FP = {fp}', ha='center', va='center', color='red', fontsize=10, fontweight='bold')
    axes[0].text(0.5, 1.25, f'FN = {fn}', ha='center', va='center', color='red', fontsize=10, fontweight='bold')
    axes[0].text(1.5, 1.25, f'TP = {tp}', ha='center', va='center', color='white', fontsize=10)

    # Heatmap DT
    sns.heatmap(cm_dt, annot=True, fmt='d', cmap='Greens', ax=axes[1],
                xticklabels=labels, yticklabels=labels, cbar=False,
                annot_kws={'size': 14, 'weight': 'bold'})
    axes[1].set_title(f"Decision Tree Classifier\n(Accuracy: {accuracy_score(rep_run_data['y_test'], rep_run_data['y_pred_dt'])*100:.1f}%)", fontsize=13, fontweight='bold', pad=10)
    axes[1].set_xlabel("Nhãn Dự Báo (Predicted Label)", fontsize=11, fontweight='bold')
    axes[1].set_ylabel("Nhãn Thực Tế (True Label)", fontsize=11, fontweight='bold')
    
    tn_dt, fp_dt, fn_dt, tp_dt = cm_dt.ravel()
    axes[1].text(0.5, 0.25, f'TN = {tn_dt}', ha='center', va='center', color='black', fontsize=10)
    axes[1].text(1.5, 0.25, f'FP = {fp_dt}', ha='center', va='center', color='red', fontsize=10, fontweight='bold')
    axes[1].text(0.5, 1.25, f'FN = {fn_dt}', ha='center', va='center', color='red', fontsize=10, fontweight='bold')
    axes[1].text(1.5, 1.25, f'TP = {tp_dt}', ha='center', va='center', color='white', fontsize=10)

    plt.tight_layout()
    plt.savefig('images/confusion_matrix.png', dpi=300)
    plt.close()
    print("Đã lưu biểu đồ: images/confusion_matrix.png")

    # Biểu đồ 2: Kết quả độ chính xác qua 10 lần chạy khác nhau
    plt.figure(figsize=(10, 5.5))
    runs = np.arange(1, 11)
    acc_lr_vals = df_lr['Accuracy'].values * 100
    acc_dt_vals = df_dt['Accuracy'].values * 100
    
    plt.plot(runs, acc_lr_vals, marker='o', linewidth=2.2, color='#1f77b4', label=f'Logistic Regression (TB: {acc_lr_vals.mean():.1f}%)')
    plt.plot(runs, acc_dt_vals, marker='s', linewidth=2.2, color='#2ca02c', linestyle='--', label=f'Decision Tree (TB: {acc_dt_vals.mean():.1f}%)')
    
    # Đường trung bình
    plt.axhline(acc_lr_vals.mean(), color='#1f77b4', linestyle=':', alpha=0.7)
    plt.axhline(acc_dt_vals.mean(), color='#2ca02c', linestyle=':', alpha=0.7)
    
    plt.title("Biến thiên Độ chính xác (Accuracy) qua 10 lần chạy Train/Test khác nhau", fontsize=13, fontweight='bold', pad=12)
    plt.xlabel("Lần chạy thực nghiệm (Mỗi lần ứng với 1 seed ngẫu nhiên)", fontsize=11, fontweight='bold')
    plt.ylabel("Độ chính xác Accuracy (%)", fontsize=11, fontweight='bold')
    plt.xticks(runs)
    plt.ylim(65, 100)
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.legend(frameon=True, facecolor='white', framealpha=0.9, fontsize=10)
    
    # Hiển thị giá trị từng điểm
    for r, v in zip(runs, acc_lr_vals):
        plt.annotate(f"{v:.1f}%", (r, v), textcoords="offset points", xytext=(0, 7), ha='center', fontsize=8.5, color='#1f77b4', fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('images/accuracy_10_runs.png', dpi=300)
    plt.close()
    print("Đã lưu biểu đồ: images/accuracy_10_runs.png")

    # Biểu đồ 3: Mức độ ảnh hưởng của các đặc trưng (Feature Importance / Coefficients)
    fig, axes = plt.subplots(1, 2, figsize=(13, 5))
    feature_vn = ['Ngày GD', 'Tuổi nhà', 'Khoảng cách ga MRT', 'Số CH tiện lợi', 'Vĩ độ', 'Kinh độ']
    
    # Hệ số Logistic Regression
    lr_coefs = rep_run_data['lr_coefs']
    colors_lr = ['#e74c3c' if c < 0 else '#2ecc71' for c in lr_coefs]
    axes[0].barh(feature_vn, lr_coefs, color=colors_lr, edgecolor='gray')
    axes[0].set_title("Hệ số hồi quy Logistic (Tác động tới xác suất Giá cao)", fontsize=12, fontweight='bold')
    axes[0].set_xlabel("Giá trị trọng số (Coefficients)", fontsize=10, fontweight='bold')
    axes[0].axvline(0, color='black', linewidth=0.8, linestyle='--')
    
    # Độ quan trọng Decision Tree
    dt_imp = rep_run_data['dt_importances']
    axes[1].barh(feature_vn, dt_imp, color='#3498db', edgecolor='gray')
    axes[1].set_title("Mức độ quan trọng đặc trưng (Decision Tree Gini Importance)", fontsize=12, fontweight='bold')
    axes[1].set_xlabel("Độ quan trọng chuẩn hóa", fontsize=10, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('images/feature_importance.png', dpi=300)
    plt.close()
    print("Đã lưu biểu đồ: images/feature_importance.png")

    # Biểu đồ 4: Dự báo giá thực tế vs Dự báo hồi quy (Actual vs Predicted Price)
    plt.figure(figsize=(8, 6))
    y_true_reg = rep_run_data['y_test_reg']
    y_pred_r = rep_run_data['y_pred_reg_lr']
    
    plt.scatter(y_true_reg, y_pred_r, color='#2980b9', alpha=0.75, edgecolors='k', s=60, label='Mẫu kiểm thử (Test Samples)')
    min_val = min(y_true_reg.min(), y_pred_r.min())
    max_val = max(y_true_reg.max(), y_pred_r.max())
    plt.plot([min_val, max_val], [min_val, max_val], 'r--', linewidth=2, label='Đường lý tưởng (y = x)')
    
    plt.title(f"So sánh Giá thực tế vs Giá dự báo (Mô hình Hồi quy Tuyến tính)\nR² = {r2_score(y_true_reg, y_pred_r):.3f}, RMSE = {np.sqrt(mean_squared_error(y_true_reg, y_pred_r)):.2f}", fontsize=12, fontweight='bold', pad=10)
    plt.xlabel("Giá thực tế (10.000 NTD/Ping)", fontsize=11, fontweight='bold')
    plt.ylabel("Giá dự báo (10.000 NTD/Ping)", fontsize=11, fontweight='bold')
    plt.legend(frameon=True, facecolor='white', framealpha=0.9)
    plt.grid(True, linestyle='--', alpha=0.5)
    
    plt.tight_layout()
    plt.savefig('images/actual_vs_predicted.png', dpi=300)
    plt.close()
    print("Đã lưu biểu đồ: images/actual_vs_predicted.png")
    
    # Lưu tóm tắt metrics JSON cho script sinh báo cáo Word
    summary_data = {
        'median_price': float(median_price),
        'total_samples': len(df),
        'train_samples': len(X_train),
        'test_samples': len(X_test),
        'lr_mean_acc': float(df_lr['Accuracy'].mean()),
        'lr_std_acc': float(df_lr['Accuracy'].std()),
        'lr_min_acc': float(df_lr['Accuracy'].min()),
        'lr_max_acc': float(df_lr['Accuracy'].max()),
        'lr_mean_prec': float(df_lr['Precision'].mean()),
        'lr_mean_rec': float(df_lr['Recall'].mean()),
        'lr_mean_f1': float(df_lr['F1_Score'].mean()),
        'dt_mean_acc': float(df_dt['Accuracy'].mean()),
        'dt_std_acc': float(df_dt['Accuracy'].std()),
        'dt_min_acc': float(df_dt['Accuracy'].min()),
        'dt_max_acc': float(df_dt['Accuracy'].max()),
        'dt_mean_prec': float(df_dt['Precision'].mean()),
        'dt_mean_rec': float(df_dt['Recall'].mean()),
        'dt_mean_f1': float(df_dt['F1_Score'].mean()),
        'reg_lr_r2_mean': float(df_reg_lr['R2'].mean()),
        'reg_lr_rmse_mean': float(df_reg_lr['RMSE'].mean()),
        'rep_run': {
            'cm_lr': cm_lr.tolist(),
            'cm_dt': cm_dt.tolist(),
            'acc_lr': float(accuracy_score(rep_run_data['y_test'], rep_run_data['y_pred_lr'])),
            'acc_dt': float(accuracy_score(rep_run_data['y_test'], rep_run_data['y_pred_dt']))
        }
    }
    with open('metrics_summary.json', 'w', encoding='utf-8') as f:
        json.dump(summary_data, f, ensure_ascii=False, indent=2)
    print("Đã lưu 'metrics_summary.json'")
    print("=== THỰC NGHIỆM HOÀN TẤT THÀNH CÔNG ===")

if __name__ == '__main__':
    main()
