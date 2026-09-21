/**
 * MAZE ENGINE & MAP GENERATOR
 * Quản lý cấu trúc lưới mê cung, các mẫu bản đồ dựng sẵn và thuật toán sinh mê cung tự động.
 */

export const CellType = {
    EMPTY: 0,
    WALL: 1
};

export class Maze {
    constructor(rows = 21, cols = 21) {
        this.setDimensions(rows, cols);
        this.resetToDefault();
    }

    setDimensions(rows, cols) {
        // Đảm bảo số hàng và cột lẻ để sinh mê cung đẹp mắt với thuật toán mê cung hoàn hảo
        this.rows = Math.max(7, Math.min(61, rows));
        this.cols = Math.max(7, Math.min(61, cols));
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(CellType.EMPTY));
        
        // Vị trí mặc định: Start ở góc trên trái, Goal ở góc dưới phải
        this.start = { r: 1, c: 1 };
        this.goal = { r: this.rows - 2, c: this.cols - 2 };
        
        // Tạo viền tường bao quanh
        this.buildOuterWalls();
    }

    buildOuterWalls() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) {
                    this.grid[r][c] = CellType.WALL;
                }
            }
        }
        // Đảm bảo start và goal luôn thông thoáng
        this.grid[this.start.r][this.start.c] = CellType.EMPTY;
        this.grid[this.goal.r][this.goal.c] = CellType.EMPTY;
    }

    clearWalls(keepBorders = true) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (keepBorders && (r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1)) {
                    this.grid[r][c] = CellType.WALL;
                } else {
                    this.grid[r][c] = CellType.EMPTY;
                }
            }
        }
        this.grid[this.start.r][this.start.c] = CellType.EMPTY;
        this.grid[this.goal.r][this.goal.c] = CellType.EMPTY;
    }

    setWall(r, c, isWall) {
        if (r <= 0 || r >= this.rows - 1 || c <= 0 || c >= this.cols - 1) return;
        if ((r === this.start.r && c === this.start.c) || (r === this.goal.r && c === this.goal.c)) return;
        this.grid[r][c] = isWall ? CellType.WALL : CellType.EMPTY;
    }

    setStart(r, c) {
        if (r <= 0 || r >= this.rows - 1 || c <= 0 || c >= this.cols - 1) return;
        if (r === this.goal.r && c === this.goal.c) return;
        this.grid[r][c] = CellType.EMPTY;
        this.start = { r, c };
    }

    setGoal(r, c) {
        if (r <= 0 || r >= this.rows - 1 || c <= 0 || c >= this.cols - 1) return;
        if (r === this.start.r && c === this.start.c) return;
        this.grid[r][c] = CellType.EMPTY;
        this.goal = { r, c };
    }

    isWalkable(r, c) {
        return r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.grid[r][c] !== CellType.WALL;
    }

    clone() {
        const copy = new Maze(this.rows, this.cols);
        copy.grid = this.grid.map(row => [...row]);
        copy.start = { ...this.start };
        copy.goal = { ...this.goal };
        return copy;
    }

    resetToDefault() {
        this.generateRecursiveBacktracker();
    }

    /**
     * THUẬT TOÁN SINH MÊ CUNG: Recursive Backtracker (DFS Maze)
     * Tạo mê cung hoàn hảo (Perfect Maze), không có vòng lặp, nhiều ngã rẽ sâu
     */
    generateRecursiveBacktracker() {
        // Lấp đầy tường bên trong
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c] = CellType.WALL;
            }
        }

        const stack = [];
        // Điểm bắt đầu đào đường (chọn ô có tọa độ lẻ)
        const startR = 1;
        const startC = 1;
        this.grid[startR][startC] = CellType.EMPTY;
        stack.push({ r: startR, c: startC });

        const dirs = [
            { dr: -2, dc: 0, wallR: -1, wallC: 0 },
            { dr: 2, dc: 0, wallR: 1, wallC: 0 },
            { dr: 0, dc: -2, wallR: 0, wallC: -1 },
            { dr: 0, dc: 2, wallR: 0, wallC: 1 }
        ];

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            // Tìm các ô lân cận cách 2 bước chưa thăm
            const neighbors = [];
            for (const d of dirs) {
                const nr = current.r + d.dr;
                const nc = current.c + d.dc;
                if (nr > 0 && nr < this.rows - 1 && nc > 0 && nc < this.cols - 1 && this.grid[nr][nc] === CellType.WALL) {
                    neighbors.push({ ...d, nr, nc });
                }
            }

            if (neighbors.length > 0) {
                // Chọn ngẫu nhiên 1 ô lân cận
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                // Đục thông tường ở giữa
                this.grid[current.r + next.wallR][current.c + next.wallC] = CellType.EMPTY;
                this.grid[next.nr][next.nc] = CellType.EMPTY;
                stack.push({ r: next.nr, c: next.nc });
            } else {
                stack.pop();
            }
        }

        // Đảm bảo Start và Goal thông thoáng
        this.start = { r: 1, c: 1 };
        this.goal = { r: this.rows % 2 === 0 ? this.rows - 3 : this.rows - 2, c: this.cols % 2 === 0 ? this.cols - 3 : this.cols - 2 };
        this.grid[this.start.r][this.start.c] = CellType.EMPTY;
        this.grid[this.goal.r][this.goal.c] = CellType.EMPTY;
        this.buildOuterWalls();
    }

    /**
     * THUẬT TOÁN SINH MÊ CUNG: Prim's Algorithm
     * Tạo mê cung tự nhiên với nhiều nhánh ngắn, phân nhánh mạnh
     */
    generatePrims() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c] = CellType.WALL;
            }
        }

        const wallsList = [];
        const startR = 1;
        const startC = 1;
        this.grid[startR][startC] = CellType.EMPTY;

        const addWalls = (r, c) => {
            const dirs = [
                { dr: -2, dc: 0, wr: -1, wc: 0 },
                { dr: 2, dc: 0, wr: 1, wc: 0 },
                { dr: 0, dc: -2, wr: 0, wc: -1 },
                { dr: 0, dc: 2, wr: 0, wc: 1 }
            ];
            for (const d of dirs) {
                const nr = r + d.dr;
                const nc = c + d.dc;
                if (nr > 0 && nr < this.rows - 1 && nc > 0 && nc < this.cols - 1 && this.grid[nr][nc] === CellType.WALL) {
                    wallsList.push({ r: nr, c: nc, wr: r + d.wr, wc: c + d.wc });
                }
            }
        };

        addWalls(startR, startC);

        while (wallsList.length > 0) {
            const randIdx = Math.floor(Math.random() * wallsList.length);
            const wall = wallsList.splice(randIdx, 1)[0];

            if (this.grid[wall.r][wall.c] === CellType.WALL) {
                this.grid[wall.wr][wall.wc] = CellType.EMPTY;
                this.grid[wall.r][wall.c] = CellType.EMPTY;
                addWalls(wall.r, wall.c);
            }
        }

        this.start = { r: 1, c: 1 };
        this.goal = { r: this.rows % 2 === 0 ? this.rows - 3 : this.rows - 2, c: this.cols % 2 === 0 ? this.cols - 3 : this.cols - 2 };
        this.grid[this.start.r][this.start.c] = CellType.EMPTY;
        this.grid[this.goal.r][this.goal.c] = CellType.EMPTY;
        this.buildOuterWalls();
    }

    /**
     * MẪU BẢN ĐỒ: Mê cung xoắn ốc (Spiral Maze)
     * Thử thách lớn về số bước duyệt của DFS so với A*
     */
    generateSpiral() {
        this.clearWalls(true);
        let top = 2, bottom = this.rows - 3, left = 2, right = this.cols - 3;
        
        while (top <= bottom && left <= right) {
            // Tường ngang trên
            for (let c = left; c <= right; c++) this.grid[top][c] = CellType.WALL;
            // Tường dọc phải
            for (let r = top; r <= bottom; r++) this.grid[r][right] = CellType.WALL;
            // Tường ngang dưới
            for (let c = right; c >= left; c--) this.grid[bottom][c] = CellType.WALL;
            // Tường dọc trái
            for (let r = bottom; r >= top + 2; r--) this.grid[r][left] = CellType.WALL;

            // Mở cửa thoát cho vòng xoắn
            if (top + 1 < this.rows - 1) this.grid[top + 1][left] = CellType.EMPTY;
            if (top + 2 < this.rows - 1 && left + 1 < this.cols - 1) this.grid[top + 2][left] = CellType.EMPTY;

            top += 2;
            bottom -= 2;
            left += 2;
            right -= 2;
        }

        this.start = { r: 1, c: 1 };
        this.goal = { r: Math.floor(this.rows / 2), c: Math.floor(this.cols / 2) };
        this.grid[this.start.r][this.start.c] = CellType.EMPTY;
        this.grid[this.goal.r][this.goal.c] = CellType.EMPTY;
        this.buildOuterWalls();
    }

    /**
     * MẪU BẢN ĐỒ: Các phòng và hành lang thông nhau (Rooms & Dungeon Corridors)
     */
    generateRooms() {
        this.clearWalls(true);
        const roomSize = Math.max(4, Math.floor(this.rows / 3));

        // Tạo lưới tường chia thành các phòng
        for (let r = 1; r < this.rows - 1; r++) {
            for (let c = 1; c < this.cols - 1; c++) {
                if (r % roomSize === 0 || c % roomSize === 0) {
                    this.grid[r][c] = CellType.WALL;
                }
            }
        }

        // Đục các cửa thông giữa các phòng
        for (let r = 1; r < this.rows - 1; r += roomSize) {
            for (let c = 1; c < this.cols - 1; c += roomSize) {
                const doorR = Math.min(this.rows - 2, r + Math.floor(roomSize / 2));
                const doorC = Math.min(this.cols - 2, c + Math.floor(roomSize / 2));
                if (doorR < this.rows - 1) this.grid[doorR][c] = CellType.EMPTY;
                if (doorC < this.cols - 1) this.grid[r][doorC] = CellType.EMPTY;
            }
        }

        this.start = { r: 1, c: 1 };
        this.goal = { r: this.rows - 2, c: this.cols - 2 };
        this.grid[this.start.r][this.start.c] = CellType.EMPTY;
        this.grid[this.goal.r][this.goal.c] = CellType.EMPTY;
        this.buildOuterWalls();
    }

    /**
     * MẪU BẢN ĐỒ: Không gian mở với vật cản ngẫu nhiên (Open Field with Obstacles)
     * Thích hợp minh họa trực quan sự vượt trội của Heuristic A* so với BFS
     */
    generateObstacleField(density = 0.28) {
        this.clearWalls(true);
        for (let r = 1; r < this.rows - 1; r++) {
            for (let c = 1; c < this.cols - 1; c++) {
                if (Math.random() < density) {
                    this.grid[r][c] = CellType.WALL;
                }
            }
        }

        this.start = { r: 1, c: 1 };
        this.goal = { r: this.rows - 2, c: this.cols - 2 };
        // Mở thông 1 bán kính nhỏ quanh start và goal để không bị kẹt ngay lập tức
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (this.start.r + dr > 0 && this.start.r + dr < this.rows - 1 &&
                    this.start.c + dc > 0 && this.start.c + dc < this.cols - 1) {
                    this.grid[this.start.r + dr][this.start.c + dc] = CellType.EMPTY;
                }
                if (this.goal.r + dr > 0 && this.goal.r + dr < this.rows - 1 &&
                    this.goal.c + dc > 0 && this.goal.c + dc < this.cols - 1) {
                    this.grid[this.goal.r + dr][this.goal.c + dc] = CellType.EMPTY;
                }
            }
        }
        this.buildOuterWalls();
    }

    /**
     * MẪU BẢN ĐỒ: Trường hợp không có đường đi (No-Path Map)
     * Kiểm tra khả năng duyệt toàn bộ không gian và kết luận chính xác không có đường đi
     */
    generateNoPath() {
        this.generateRecursiveBacktracker();
        // Xây tường chặn kín mọi hướng đi vào điểm Goal
        const r = this.goal.r;
        const c = this.goal.c;
        const neighbors = [
            { r: r - 1, c }, { r: r + 1, c },
            { r, c: c - 1 }, { r, c: c + 1 }
        ];
        for (const n of neighbors) {
            if (n.r >= 0 && n.r < this.rows && n.c >= 0 && n.c < this.cols) {
                this.grid[n.r][n.c] = CellType.WALL;
            }
        }
        this.grid[r][c] = CellType.EMPTY;
    }

    /**
     * Xuất dữ liệu bản đồ dạng JSON để lưu trữ hoặc chia sẻ
     */
    toJSON() {
        return JSON.stringify({
            rows: this.rows,
            cols: this.cols,
            start: this.start,
            goal: this.goal,
            grid: this.grid
        });
    }

    /**
     * Nạp dữ liệu bản đồ từ chuỗi JSON
     */
    fromJSON(jsonStr) {
        try {
            const data = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
            this.rows = data.rows;
            this.cols = data.cols;
            this.grid = data.grid;
            this.start = data.start;
            this.goal = data.goal;
            this.buildOuterWalls();
            return true;
        } catch (e) {
            console.error('Lỗi khi nạp bản đồ từ JSON:', e);
            return false;
        }
    }
}
