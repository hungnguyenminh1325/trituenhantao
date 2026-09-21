/**
 * REPORT & BENCHMARK EXPORTER
 * Tạo ảnh báo cáo thực nghiệm độ phân giải cao (Full HD 1920x1080 PNG)
 * tổng hợp ảnh bản đồ kết quả của 3 thuật toán, bảng số liệu KPI và biểu đồ so sánh.
 * Phục vụ hoàn hảo việc chèn vào Báo cáo Word BTL (Chương 5: Thực nghiệm và Đánh giá).
 */

export class ReportGenerator {
    constructor(maze, controller, visualizers) {
        this.maze = maze;
        this.controller = controller;
        this.visualizers = visualizers; // { bfs, dfs, astar }
    }

    /**
     * Xuất file ảnh báo cáo PNG chất lượng cao Full HD (1920x1200)
     */
    async generateReportImage() {
        const width = 1920;
        const height = 1200;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // 1. Nền tối sâu sang trọng
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#0a0e1a');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#080c14');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Họa tiết lưới kỹ thuật mờ
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // 2. Banner Header Bài Tập Lớn
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
        ctx.fillText('TRƯỜNG ĐẠI HỌC CÔNG NGHỆ ĐÔNG Á • KHOA CÔNG NGHỆ THÔNG TIN', 80, 55);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
        ctx.fillText('BÁO CÁO KẾT QUẢ THỰC NGHIỆM TÌM ĐƯỜNG MÊ CUNG', 80, 105);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '18px "Segoe UI", Arial, sans-serif';
        ctx.fillText('So Sánh Hiệu Năng Thuật Toán: BFS (Chiều rộng) • DFS (Chiều sâu) • A* (Heuristic Manhattan)', 80, 138);

        // Đường kẻ ngăn cách phát sáng
        const lineGrad = ctx.createLinearGradient(80, 155, width - 80, 155);
        lineGrad.addColorStop(0, '#06b6d4');
        lineGrad.addColorStop(0.5, '#3b82f6');
        lineGrad.addColorStop(1, '#10b981');
        ctx.fillStyle = lineGrad;
        ctx.fillRect(80, 155, width - 160, 3);

        // 3. Khối Thông Tin Cấu Hình Thực Nghiệm (Config Card)
        ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(80, 175, width - 160, 70, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '16px "Segoe UI", Arial, sans-serif';
        const startStr = `(${this.maze.start.r}, ${this.maze.start.c})`;
        const goalStr = `(${this.maze.goal.r}, ${this.maze.goal.c})`;
        const heuristicStr = this.controller.options.heuristic === 'euclidean' ? 'Euclidean' : 'Manhattan | h(n) = |Δr| + |Δc|';
        const dateStr = new Date().toLocaleString('vi-VN');

        ctx.fillText(`📐 Kích thước lưới: ${this.maze.rows} × ${this.maze.cols} (${this.maze.rows * this.maze.cols} ô)`, 110, 215);
        ctx.fillText(`🚀 Xuất phát (Start): ${startStr}`, 520, 215);
        ctx.fillText(`🎯 Đích đến (Goal): ${goalStr}`, 830, 215);
        ctx.fillText(`⚡ Heuristic A*: ${heuristicStr}`, 1140, 215);
        ctx.fillText(`🕒 Thời gian tạo: ${dateStr}`, 1540, 215);

        // 4. Vẽ 3 Bản Đồ Snapshot Cạnh Nhau (BFS, DFS, A*)
        const mapY = 270;
        const mapCardWidth = 550;
        const mapCardHeight = 440;
        const gap = 55;

        const algoConfigs = [
            { key: 'bfs', title: 'THUẬT TOÁN BFS (Chiều Rộng)', color: '#06b6d4', x: 80 },
            { key: 'dfs', title: 'THUẬT TOÁN DFS (Chiều Sâu)', color: '#f59e0b', x: 80 + mapCardWidth + gap },
            { key: 'astar', title: 'THUẬT TOÁN A* (Heuristic)', color: '#10b981', x: 80 + (mapCardWidth + gap) * 2 }
        ];

        for (const cfg of algoConfigs) {
            // Khung thẻ thuật toán
            ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
            ctx.strokeStyle = cfg.color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(cfg.x, mapY, mapCardWidth, mapCardHeight, 12);
            ctx.fill();
            ctx.stroke();

            // Tiêu đề thuật toán
            ctx.fillStyle = cfg.color;
            ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
            ctx.fillText(cfg.title, cfg.x + 20, mapY + 35);

            // Chụp ảnh Canvas của thuật toán
            const sourceCanvas = this.visualizers[cfg.key].canvas;
            const canvasAspect = sourceCanvas.width / sourceCanvas.height;
            const previewMaxW = mapCardWidth - 40;
            const previewMaxH = mapCardHeight - 65;
            let drawW = previewMaxW;
            let drawH = drawW / canvasAspect;
            if (drawH > previewMaxH) {
                drawH = previewMaxH;
                drawW = drawH * canvasAspect;
            }
            const drawX = cfg.x + (mapCardWidth - drawW) / 2;
            const drawY = mapY + 50 + (previewMaxH - drawH) / 2;

            ctx.drawImage(sourceCanvas, drawX, drawY, drawW, drawH);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.strokeRect(drawX, drawY, drawW, drawH);
        }

        // 5. Bảng Dữ Liệu So Sánh Chi Tiết (KPI Table)
        const tableY = 740;
        const tableW = 1050;
        const tableH = 260;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(80, tableY, tableW, tableH, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
        ctx.fillText('📊 BẢNG TỔNG HỢP CHỈ SỐ SO SÁNH HIỆU NĂNG', 110, tableY + 38);

        // Header cột bảng
        const colsX = [110, 240, 420, 590, 760, 930];
        const headers = ['Thuật toán', 'Thời gian (ms)', 'Số ô duyệt', 'Độ dài đường', 'Bộ nhớ đỉnh', 'Tính tối ưu'];
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
        headers.forEach((h, idx) => ctx.fillText(h, colsX[idx], tableY + 75));

        // Đường kẻ dưới header
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(100, tableY + 88, tableW - 40, 1);

        // Dữ liệu từng dòng
        const metrics = this.controller.getMetrics();
        const rowHeights = [tableY + 125, tableY + 175, tableY + 225];
        const colors = ['#06b6d4', '#f59e0b', '#10b981'];

        metrics.forEach((m, idx) => {
            const y = rowHeights[idx];
            ctx.fillStyle = colors[idx];
            ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
            ctx.fillText(m.name, colsX[0], y);

            ctx.fillStyle = '#ffffff';
            ctx.font = '15px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`${m.executionTime} ms`, colsX[1], y);
            ctx.fillText(`${m.visitedCount} ô (${m.visitedPercent}%)`, colsX[2], y);
            ctx.fillText(`${m.pathLength > 0 ? m.pathLength - 1 : '0'} bước`, colsX[3], y);
            ctx.fillText(`${m.maxFrontier} nút`, colsX[4], y);

            // Nhận xét tối ưu
            if (m.name === 'DFS') {
                ctx.fillStyle = '#f43f5e';
                ctx.fillText('Không tối ưu (Dài)', colsX[5], y);
            } else {
                ctx.fillStyle = '#10b981';
                ctx.fillText('Tối ưu ngắn nhất', colsX[5], y);
            }

            // Kẻ dòng mờ ngăn cách
            if (idx < 2) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.fillRect(100, y + 15, tableW - 40, 1);
            }
        });

        // 6. Biểu Đồ Cột So Sánh Trực Quan (Mini Chart Panel)
        const chartX = 1160;
        const chartY = tableY;
        const chartW = width - chartX - 80;
        const chartH = tableH;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(chartX, chartY, chartW, chartH, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
        ctx.fillText('📈 SO SÁNH SỐ Ô ĐÃ DUYỆT', chartX + 30, chartY + 38);

        // Vẽ biểu đồ thanh ngang
        const maxVisited = Math.max(1, ...metrics.map(m => m.visitedCount));
        const barYStarts = [chartY + 85, chartY + 140, chartY + 195];
        const barMaxW = chartW - 200;

        metrics.forEach((m, idx) => {
            const by = barYStarts[idx];
            ctx.fillStyle = '#cbd5e1';
            ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
            ctx.fillText(m.name, chartX + 30, by + 18);

            const bWidth = Math.max(8, (m.visitedCount / maxVisited) * barMaxW);
            ctx.fillStyle = colors[idx];
            ctx.beginPath();
            ctx.roundRect(chartX + 85, by, bWidth, 24, 4);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = '14px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`${m.visitedCount} ô`, chartX + 95 + bWidth, by + 17);
        });

        // 7. Khối Nhận Xét Khoa Học (Academic Findings - Sẵn sàng chép vào Word Chương 5)
        const concY = 1025;
        const concH = 140;
        ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(80, concY, width - 160, concH, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
        ctx.fillText('📝 KẾT LUẬN & ĐÁNH GIÁ THỰC NGHIỆM (Trích dẫn cho Báo cáo BTL - Chương 5):', 110, concY + 35);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '15px "Segoe UI", Arial, sans-serif';
        ctx.fillText('• BFS: Luôn đảm bảo tìm ra đường đi ngắn nhất do mở rộng theo từng mức khoảng cách, nhưng phải duyệt nhiều ô và tốn nhiều bộ nhớ hàng đợi.', 110, concY + 65);
        ctx.fillText('• DFS: Tốc độ đâm sâu nhanh, tiết kiệm bộ nhớ đỉnh, nhưng đường đi tìm được không tối ưu và phụ thuộc nhiều vào thứ tự nhánh rẽ.', 110, concY + 92);
        ctx.fillText('• A*: Nhờ hàm Heuristic định hướng (Manhattan), A* giảm thiểu tối đa các nhánh duyệt dư thừa, vừa đảm bảo đường đi tối ưu vừa đạt hiệu suất vượt trội.', 110, concY + 119);

        return canvas.toDataURL('image/png');
    }

    /**
     * Tự động tải ảnh báo cáo về máy người dùng
     */
    async downloadReportPNG(filename = 'BaoCao_ThucNghiem_MeCung_BFS_DFS_AStar.png') {
        const dataUrl = await this.generateReportImage();
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Xuất bảng dữ liệu dưới định dạng Markdown để chép thẳng vào file Word / Notion
     */
    getMarkdownTable() {
        const metrics = this.controller.getMetrics();
        let md = `### Bảng So Sánh Hiệu Năng BFS, DFS và A*\n\n`;
        md += `| Thuật toán | Thời gian (ms) | Số ô đã duyệt | Tỉ lệ bản đồ | Độ dài đường đi | Bộ nhớ đỉnh (nút) | Tính tối ưu |\n`;
        md += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: |\n`;
        for (const m of metrics) {
            const optStr = m.name === 'DFS' ? 'Không tối ưu' : 'Ngắn nhất (Tối ưu)';
            md += `| **${m.name}** | ${m.executionTime} | ${m.visitedCount} | ${m.visitedPercent}% | ${m.pathLength > 0 ? m.pathLength - 1 : 0} | ${m.maxFrontier} | ${optStr} |\n`;
        }
        return md;
    }

    /**
     * Xuất dữ liệu CSV
     */
    downloadCSV(filename = 'thuc_nghiem_me_cung.csv') {
        const metrics = this.controller.getMetrics();
        let csv = `ThuatToan,ThoiGian_ms,SoODaDuyet,TiLeDuyet_PhanTram,DoDaiDuongDi,BoNhoDinh_Nut,ToiUu\n`;
        for (const m of metrics) {
            const optStr = m.name === 'DFS' ? 'Khong' : 'ToiUu';
            csv += `${m.name},${m.executionTime},${m.visitedCount},${m.visitedPercent},${m.pathLength > 0 ? m.pathLength - 1 : 0},${m.maxFrontier},${optStr}\n`;
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }
}
