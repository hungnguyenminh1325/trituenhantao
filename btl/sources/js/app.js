import { Maze } from './maze.js?v=4.0';
import { SimulationController } from './algorithms.js?v=4.0';
import { MazeVisualizer } from './visualizer.js?v=4.0';
import { ReportGenerator } from './report.js?v=4.0';

class Application {
    constructor() {
        this.maze = new Maze(15, 15);
        this.cellSize = 15;
        this.initElements();
        this.initEngine();
        this.initCharts();
        this.bindEvents();
        this.renderAll();
    }

    initElements() {
        // Nút điều khiển
        this.btnPlay = document.getElementById('btnPlay');
        this.btnPlayText = document.getElementById('btnPlayText');
        this.btnStep = document.getElementById('btnStep');
        this.btnInstant = document.getElementById('btnInstant');
        this.btnReset = document.getElementById('btnReset');

        // Bản đồ & Mẫu
        this.selectMapPreset = document.getElementById('selectMapPreset');
        this.btnGenRandom = document.getElementById('btnGenRandom');

        // Kích thước lưới
        this.selectGridSize = document.getElementById('selectGridSize');

        // Tốc độ & Heuristic
        this.sliderSpeed = document.getElementById('sliderSpeed');
        this.valSpeed = document.getElementById('valSpeed');
        this.selectHeuristic = document.getElementById('selectHeuristic');

        // Bảng & Canvas
        this.tableMetricsBody = document.getElementById('tableMetricsBody');
        this.toastContainer = document.getElementById('toastContainer');
    }

    initEngine() {
        // Khởi tạo bộ điều phối thuật toán
        this.controller = new SimulationController(this.maze, {
            speed: parseInt(this.sliderSpeed.value, 10),
            heuristic: this.selectHeuristic.value,
            onTick: (metrics) => this.onSimulationTick(metrics),
            onComplete: (metrics) => this.onSimulationComplete(metrics)
        });

        // Khởi tạo 3 Canvas Visualizer song song (luôn vẽ đường đi khi tìm thấy đích)
        const cellSize = this.cellSize || 15;
        this.visualizers = {
            bfs: new MazeVisualizer(document.getElementById('canvasBFS'), this.maze, this.controller.bfs, {
                theme: 'bfs',
                cellSize: cellSize,
                interactive: true,
                showPath: true
            }),
            dfs: new MazeVisualizer(document.getElementById('canvasDFS'), this.maze, this.controller.dfs, {
                theme: 'dfs',
                cellSize: cellSize,
                interactive: true,
                showPath: true
            }),
            astar: new MazeVisualizer(document.getElementById('canvasAStar'), this.maze, this.controller.astar, {
                theme: 'astar',
                cellSize: cellSize,
                interactive: true,
                showPath: true
            })
        };

        // Khởi tạo công cụ xuất báo cáo
        this.reportGenerator = new ReportGenerator(this.maze, this.controller, this.visualizers);
    }

    initCharts() {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js chưa tải được, sẽ dùng chế độ bảng số liệu.');
            return;
        }

        const chartColors = ['#2563eb', '#d97706', '#059669'];
        const chartBorders = ['#1d4ed8', '#b45309', '#047857'];
        const labels = ['BFS', 'DFS', 'A*'];

        const baseChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 250 },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0f172a',
                    titleColor: '#ffffff',
                    bodyColor: '#f1f5f9',
                    borderColor: '#cbd5e1',
                    borderWidth: 1,
                    padding: 8
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0, 0, 0, 0.06)' },
                    ticks: { color: '#475569', font: { family: 'Inter', weight: '600', size: 12 } }
                },
                y: {
                    grid: { color: 'rgba(0, 0, 0, 0.06)' },
                    ticks: { color: '#475569', font: { family: 'JetBrains Mono', size: 11 } },
                    beginAtZero: true
                }
            }
        };

        // 1. Biểu đồ Số ô đã duyệt
        this.chartVisited = new Chart(document.getElementById('chartVisited'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: chartColors,
                    borderColor: chartBorders,
                    borderWidth: 1,
                    borderRadius: 3
                }]
            },
            options: baseChartOptions
        });

        // 2. Biểu đồ Độ dài đường đi
        this.chartPathLength = new Chart(document.getElementById('chartPathLength'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: chartColors,
                    borderColor: chartBorders,
                    borderWidth: 1,
                    borderRadius: 3
                }]
            },
            options: baseChartOptions
        });

        // 3. Biểu đồ Thời gian thực thi
        this.chartTime = new Chart(document.getElementById('chartTime'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: chartColors,
                    borderColor: chartBorders,
                    borderWidth: 1,
                    borderRadius: 3
                }]
            },
            options: baseChartOptions
        });
    }

    bindEvents() {
        // Chạy / Tạm dừng
        this.btnPlay.addEventListener('click', () => this.togglePlay());
        // Bước 1 nhịp
        this.btnStep.addEventListener('click', () => {
            this.controller.pause();
            this.updatePlayBtnState(false);
            this.controller.step();
            this.renderAll();
        });
        // Giải tức thì
        this.btnInstant.addEventListener('click', () => {
            this.controller.solveInstant();
            this.updatePlayBtnState(false);
            this.renderAll();
            this.showToast('Đã giải tức thì và cập nhật số liệu thực nghiệm.');
        });
        // Đặt lại
        this.btnReset.addEventListener('click', () => {
            this.controller.reset();
            this.updatePlayBtnState(false);
            this.renderAll();
            this.showToast('Đã đặt lại trạng thái mô phỏng.');
        });

        // Đổi mẫu bản đồ
        this.selectMapPreset.addEventListener('change', (e) => {
            this.applyPreset(e.target.value);
        });

        // Sinh bản đồ ngẫu nhiên mới
        this.btnGenRandom.addEventListener('click', () => {
            this.applyPreset(this.selectMapPreset.value);
            this.showToast('Đã tạo bản đồ ngẫu nhiên mới.');
        });

        // Đổi kích thước lưới (Scale Grid Dimensions)
        this.selectGridSize.addEventListener('change', (e) => {
            const size = parseInt(e.target.value, 10);
            this.changeGridDimensions(size, size);
        });

        // Slider Tốc độ
        this.sliderSpeed.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            this.valSpeed.textContent = `${val}x`;
            this.controller.setSpeed(val);
        });

        // Đổi Heuristic cho A*
        this.selectHeuristic.addEventListener('change', (e) => {
            this.controller.setHeuristic(e.target.value);
            this.controller.reset();
            this.renderAll();
            this.showToast(`A* áp dụng hàm Heuristic: ${e.target.options[e.target.selectedIndex].text}`);
        });

        // Lắng nghe sự kiện vẽ/sửa mê cung từ chuột
        window.addEventListener('mazeUpdated', () => {
            this.controller.reset();
            this.renderAll();
        });

        // Phím tắt bàn phím
        window.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            } else if (e.key === 'r' || e.key === 'R') {
                this.controller.reset();
                this.updatePlayBtnState(false);
                this.renderAll();
            }
        });
    }

    togglePlay() {
        if (this.controller.isRunning) {
            this.controller.pause();
            this.updatePlayBtnState(false);
        } else {
            this.controller.start();
            this.updatePlayBtnState(true);
        }
    }

    updatePlayBtnState(isRunning) {
        if (isRunning) {
            this.btnPlay.className = 'btn btn-secondary';
            this.btnPlayText.textContent = 'Tạm dừng';
        } else {
            this.btnPlay.className = 'btn btn-primary';
            this.btnPlayText.textContent = 'Chạy song song';
        }
    }

    applyPreset(type) {
        this.controller.pause();
        this.updatePlayBtnState(false);

        if (type === 'backtracker') {
            this.maze.generateRecursiveBacktracker();
        } else if (type === 'prims') {
            this.maze.generatePrims();
        } else if (type === 'spiral') {
            this.maze.generateSpiral();
        } else if (type === 'rooms') {
            this.maze.generateRooms();
        } else if (type === 'obstacles') {
            this.maze.generateObstacleField();
        } else if (type === 'nopath') {
            this.maze.generateNoPath();
        }

        this.controller.initAlgorithms();
        this.controller.reset();
        this.updateVisualizerAlgorithms();
        this.renderAll();
    }

    changeGridDimensions(rows, cols) {
        this.controller.pause();
        this.updatePlayBtnState(false);

        // Kích thước ô mặc định là 15, tự co giãn khi lưới rất lớn
        let newCellSize = 15;
        if (rows > 31) newCellSize = 10;
        this.cellSize = newCellSize;

        this.maze.setDimensions(rows, cols);
        this.applyPreset(this.selectMapPreset.value);

        Object.values(this.visualizers).forEach(v => {
            v.cellSize = newCellSize;
            v.resizeCanvas();
        });

        this.renderAll();
        this.showToast(`Đã đổi kích thước lưới sang ${rows} × ${cols}.`);
    }

    updateVisualizerAlgorithms() {
        this.visualizers.bfs.algorithm = this.controller.bfs;
        this.visualizers.dfs.algorithm = this.controller.dfs;
        this.visualizers.astar.algorithm = this.controller.astar;
    }

    onSimulationTick(metrics) {
        this.renderAll();
        this.updateTelemetryDOM(metrics);
        this.updateCharts(metrics);
    }

    onSimulationComplete(metrics) {
        this.updatePlayBtnState(false);
        this.renderAll();
        this.updateTelemetryDOM(metrics);
        this.updateCharts(metrics);
        this.showToast('Hoàn thành: Cả 3 thuật toán đã kết thúc tìm kiếm.');
    }

    renderAll() {
        this.visualizers.bfs.render();
        this.visualizers.dfs.render();
        this.visualizers.astar.render();
    }

    updateTelemetryDOM(metrics) {
        const algos = {
            BFS: {
                status: document.getElementById('statusBFS'),
                time: document.getElementById('statTimeBFS'),
                visited: document.getElementById('statVisitedBFS'),
                path: document.getElementById('statPathBFS'),
                memory: document.getElementById('statMemoryBFS')
            },
            DFS: {
                status: document.getElementById('statusDFS'),
                time: document.getElementById('statTimeDFS'),
                visited: document.getElementById('statVisitedDFS'),
                path: document.getElementById('statPathDFS'),
                memory: document.getElementById('statMemoryDFS')
            },
            'A*': {
                status: document.getElementById('statusAStar'),
                time: document.getElementById('statTimeAStar'),
                visited: document.getElementById('statVisitedAStar'),
                path: document.getElementById('statPathAStar'),
                memory: document.getElementById('statMemoryAStar')
            }
        };

        const statusMap = {
            ready: { text: 'Sẵn sàng', class: 'status-pill' },
            running: { text: 'Đang duyệt...', class: 'status-pill running' },
            found: { text: 'Tìm thấy đích', class: 'status-pill found' },
            no_path: { text: 'Không có đường', class: 'status-pill no_path' }
        };

        metrics.forEach(m => {
            const ui = algos[m.name];
            if (!ui) return;

            const st = statusMap[m.status] || statusMap.ready;
            ui.status.textContent = st.text;
            ui.status.className = st.class;

            ui.time.textContent = `${m.executionTime} ms`;
            ui.visited.textContent = `${m.visitedCount} ô (${m.visitedPercent}%)`;
            ui.path.textContent = `${m.pathLength > 0 ? m.pathLength - 1 : 0} bước`;
            ui.memory.textContent = `${m.maxFrontier} nút`;
        });

        // Cập nhật Bảng Dữ Liệu
        this.updateMetricsTable(metrics);
    }

    updateMetricsTable(metrics) {
        const colors = { BFS: 'var(--bfs-color)', DFS: 'var(--dfs-color)', 'A*': 'var(--astar-color)' };
        const statusMap = {
            ready: '<span class="status-pill">Sẵn sàng</span>',
            running: '<span class="status-pill running">Đang tìm</span>',
            found: '<span class="status-pill found">Thành công</span>',
            no_path: '<span class="status-pill no_path">Vô nghiệm</span>'
        };

        let rowsHtml = '';
        metrics.forEach(m => {
            const isDFS = m.name === 'DFS';
            const optBadge = isDFS 
                ? '<span class="badge-suboptimal">Không tối ưu</span>'
                : '<span class="badge-optimal">Tối ưu ngắn nhất</span>';

            rowsHtml += `
                <tr>
                    <td style="color: ${colors[m.name]}; font-weight: bold;">${m.name}</td>
                    <td>${statusMap[m.status] || statusMap.ready}</td>
                    <td>${m.executionTime} ms</td>
                    <td>${m.visitedCount} ô</td>
                    <td>${m.visitedPercent}%</td>
                    <td>${m.pathLength > 0 ? m.pathLength - 1 : 0} bước</td>
                    <td>${m.maxFrontier} nút</td>
                    <td>${optBadge}</td>
                </tr>
            `;
        });
        this.tableMetricsBody.innerHTML = rowsHtml;
    }

    updateCharts(metrics) {
        if (!this.chartVisited || !this.chartPathLength || !this.chartTime) return;

        const visitedData = metrics.map(m => m.visitedCount);
        const pathData = metrics.map(m => (m.pathLength > 0 ? m.pathLength - 1 : 0));
        const timeData = metrics.map(m => parseFloat(m.executionTime));

        this.chartVisited.data.datasets[0].data = visitedData;
        this.chartVisited.update('none');

        this.chartPathLength.data.datasets[0].data = pathData;
        this.chartPathLength.update('none');

        this.chartTime.data.datasets[0].data = timeData;
        this.chartTime.update('none');
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = message;
        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Khởi chạy ứng dụng khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    window.app = new Application();
});
