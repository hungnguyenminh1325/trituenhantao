/**
 * CANVAS VISUALIZER ENGINE
 * Quản lý vẽ đồ họa chất lượng cao cho 3 mê cung song song:
 * - Hiệu ứng ánh sáng neon, heatmap lan tỏa, viền phát quang
 * - Dải ruy băng đường đi ngắn nhất (Glowing Laser Ribbon)
 * - Tương tác chuột vẽ tường, kéo thả Start / Goal
 * - Tùy chỉnh tỉ lệ ô (Cell scale & zoom)
 */

import { CellType } from './maze.js?v=4.0';

export class MazeVisualizer {
    constructor(canvas, maze, algorithm, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.maze = maze;
        this.algorithm = algorithm;
        this.theme = options.theme || 'bfs'; // 'bfs' | 'dfs' | 'astar'
        this.cellSize = options.cellSize || 20;
        this.isInteractive = options.interactive || false;
        this.showPath = options.showPath !== undefined ? options.showPath : true;

        // Bảng màu cho từng thuật toán (Giao diện sáng chuẩn học thuật)
        this.themes = {
            bfs: {
                name: 'BFS (Chiều rộng)',
                accent: '#2563eb',
                visitedFill: 'rgba(37, 99, 235, ',
                frontier: '#93c5fd',
                path: '#1d4ed8',
                current: '#facc15'
            },
            dfs: {
                name: 'DFS (Chiều sâu)',
                accent: '#d97706',
                visitedFill: 'rgba(217, 119, 6, ',
                frontier: '#fde68a',
                path: '#b45309',
                current: '#facc15'
            },
            astar: {
                name: 'A* (Heuristic)',
                accent: '#059669',
                visitedFill: 'rgba(5, 150, 105, ',
                frontier: '#a7f3d0',
                path: '#047857',
                current: '#facc15'
            }
        };

        this.colorConfig = this.themes[this.theme] || this.themes.bfs;
        this.draggingElement = null;

        this.resizeCanvas();
        if (this.isInteractive) {
            this.setupMouseEvents();
        }
    }

    setCellSize(size) {
        this.cellSize = Math.max(8, Math.min(50, size));
        this.resizeCanvas();
        this.render();
    }

    resizeCanvas() {
        const width = this.maze.cols * this.cellSize;
        const height = this.maze.rows * this.cellSize;
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        this.ctx.resetTransform();
        this.ctx.scale(dpr, dpr);
    }

    render() {
        const ctx = this.ctx;
        const cols = this.maze.cols;
        const rows = this.maze.rows;
        const cs = this.cellSize;

        // Tắt hoàn toàn đổ bóng mờ ảo
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        // 1. Nền canvas trắng tinh khiết chuẩn học thuật
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cols * cs, rows * cs);

        // 2. Lưới ô vuông mờ chuẩn kỹ thuật (Slate 200)
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        for (let c = 0; c <= cols; c++) {
            ctx.beginPath();
            ctx.moveTo(c * cs, 0);
            ctx.lineTo(c * cs, rows * cs);
            ctx.stroke();
        }
        for (let r = 0; r <= rows; r++) {
            ctx.beginPath();
            ctx.moveTo(0, r * cs);
            ctx.lineTo(cols * cs, r * cs);
            ctx.stroke();
        }

        // 3. Vẽ các ô đã duyệt (Visited Nodes) - Tô màu pastel trong trẻo, rõ nét
        if (this.algorithm && this.algorithm.visited.size > 0) {
            const totalVisited = Math.max(1, this.algorithm.visitedList.length);
            for (let i = 0; i < this.algorithm.visitedList.length; i++) {
                const node = this.algorithm.visitedList[i];
                // Không vẽ đè lên Start và Goal
                if ((node.r === this.maze.start.r && node.c === this.maze.start.c) ||
                    (node.r === this.maze.goal.r && node.c === this.maze.goal.c)) {
                    continue;
                }

                // Độ đậm tăng dần theo tiến trình khám phá
                const ratio = i / totalVisited;
                const alpha = (0.2 + ratio * 0.45).toFixed(2);
                ctx.fillStyle = `${this.colorConfig.visitedFill}${alpha})`;
                ctx.fillRect(node.c * cs + 1, node.r * cs + 1, cs - 2, cs - 2);
            }
        }

        // 4. Vẽ tập biên (Frontier / Queue / Stack) - Ô màu sáng có viền nhận diện
        if (this.algorithm && (this.algorithm.status === 'running' || this.algorithm.status === 'ready')) {
            const frontierList = this.algorithm.getFrontierList ? this.algorithm.getFrontierList() : [];
            ctx.fillStyle = this.colorConfig.frontier;

            for (const item of frontierList) {
                const r = item.r;
                const c = item.c;
                if ((r === this.maze.start.r && c === this.maze.start.c) ||
                    (r === this.maze.goal.r && c === this.maze.goal.c)) {
                    continue;
                }
                ctx.fillRect(c * cs + 2, r * cs + 2, cs - 4, cs - 4);
                ctx.strokeStyle = this.colorConfig.accent;
                ctx.lineWidth = 1;
                ctx.strokeRect(c * cs + 1.5, r * cs + 1.5, cs - 3, cs - 3);
            }
        }

        // 5. Vẽ Tường (Walls) - Khối phẳng xám đá Slate-700 tương phản cao trên nền trắng
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (this.maze.grid[r][c] === CellType.WALL) {
                    this.drawWall(r, c);
                }
            }
        }

        // 6. Vẽ Đường đi tìm được khi tới đích - Đường vector sắc nét, màu chuẩn
        if (this.algorithm && this.algorithm.path && this.algorithm.path.length > 1) {
            this.drawPath();
        }

        // 7. Vẽ ô đang xét hiện tại (Current Node) - Khung vàng sáng nhận diện
        if (this.algorithm && this.algorithm.current && this.algorithm.status === 'running') {
            const cur = this.algorithm.current;
            ctx.fillStyle = '#facc15';
            ctx.fillRect(cur.c * cs + 2, cur.r * cs + 2, cs - 4, cs - 4);
            ctx.strokeStyle = '#ca8a04';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(cur.c * cs + 1.5, cur.r * cs + 1.5, cs - 3, cs - 3);
        }

        // 8. Vẽ Điểm Xuất Phát (S) và Đích (G) - Khối màu chuẩn, chữ rõ nét
        this.drawStartNode();
        this.drawGoalNode();

        // 9. Viền bao quanh canvas
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, cols * cs - 1, rows * cs - 1);
    }

    drawWall(r, c) {
        const ctx = this.ctx;
        const cs = this.cellSize;
        const x = c * cs;
        const y = r * cs;

        // Thân tường phẳng, màu xám đá Slate-700
        ctx.fillStyle = '#334155';
        ctx.fillRect(x, y, cs, cs);

        // Đường kẻ nhẹ tạo cấu trúc lưới ngăn nắp
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, cs - 1, cs - 1);
    }

    drawPath() {
        const ctx = this.ctx;
        const cs = this.cellSize;
        const path = this.algorithm.path;
        if (path.length < 2) return;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Đường dẫn chuẩn xác, màu nhận diện đậm nét trên nền trắng
        ctx.strokeStyle = this.colorConfig.path;
        ctx.lineWidth = Math.max(3, Math.round(cs * 0.35));

        ctx.beginPath();
        ctx.moveTo(path[0].c * cs + cs / 2, path[0].r * cs + cs / 2);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].c * cs + cs / 2, path[i].r * cs + cs / 2);
        }
        ctx.stroke();

        ctx.restore();
    }

    drawStartNode() {
        const ctx = this.ctx;
        const cs = this.cellSize;
        const x = this.maze.start.c * cs;
        const y = this.maze.start.r * cs;

        // Khối ô Start - Màu xanh lá cây chuẩn (Green 600)
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2);

        // Ký tự S căn giữa, màu trắng
        ctx.fillStyle = '#ffffff';
        ctx.font = `700 ${Math.max(10, Math.floor(cs * 0.55))}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', x + cs / 2, y + cs / 2);
    }

    drawGoalNode() {
        const ctx = this.ctx;
        const cs = this.cellSize;
        const x = this.maze.goal.c * cs;
        const y = this.maze.goal.r * cs;

        // Khối ô Goal - Màu đỏ chuẩn (Red 600)
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2);

        // Ký tự G căn giữa, màu trắng
        ctx.fillStyle = '#ffffff';
        ctx.font = `700 ${Math.max(10, Math.floor(cs * 0.55))}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('G', x + cs / 2, y + cs / 2);
    }

    /**
     * TƯƠNG TÁC CHUỘT: Vẽ / Xóa tường, Kéo thả Start / Goal
     */
    setupMouseEvents() {
        let isMouseDown = false;
        let mode = null; // 'start' | 'goal' | 'wall' | 'erase'

        const getGridPos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / (rect.width * (window.devicePixelRatio || 1));
            const scaleY = this.canvas.height / (rect.height * (window.devicePixelRatio || 1));
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;
            const c = Math.floor(mouseX / this.cellSize);
            const r = Math.floor(mouseY / this.cellSize);
            return { r, c };
        };

        this.canvas.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            const { r, c } = getGridPos(e);
            if (r < 0 || r >= this.maze.rows || c < 0 || c >= this.maze.cols) return;

            if (r === this.maze.start.r && c === this.maze.start.c) {
                mode = 'start';
            } else if (r === this.maze.goal.r && c === this.maze.goal.c) {
                mode = 'goal';
            } else {
                mode = null;
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!isMouseDown || !mode) return;
            const { r, c } = getGridPos(e);
            if (r <= 0 || r >= this.maze.rows - 1 || c <= 0 || c >= this.maze.cols - 1) return;

            if (mode === 'start') {
                this.maze.setStart(r, c);
                window.dispatchEvent(new CustomEvent('mazeUpdated'));
            } else if (mode === 'goal') {
                this.maze.setGoal(r, c);
                window.dispatchEvent(new CustomEvent('mazeUpdated'));
            }
        });

        const stopDrawing = () => {
            isMouseDown = false;
            mode = null;
        };

        this.canvas.addEventListener('mouseup', stopDrawing);
        this.canvas.addEventListener('mouseleave', stopDrawing);
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
}
