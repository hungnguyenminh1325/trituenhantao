/**
 * ALGORITHM SUITE: BFS, DFS, A*
 * Cài đặt chuẩn xác 3 thuật toán tìm kiếm đường đi trong mê cung,
 * hỗ trợ cơ chế chạy từng bước (Step-by-step Generator) để chạy song song đồng bộ.
 */

// Cấu trúc hàng đợi ưu tiên (Min-Heap) cho thuật toán A*
class MinHeap {
    constructor() {
        this.heap = [];
    }

    push(node) {
        this.heap.push(node);
        this._bubbleUp(this.heap.length - 1);
    }

    pop() {
        if (this.isEmpty()) return null;
        const top = this.heap[0];
        const bottom = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = bottom;
            this._sinkDown(0);
        }
        return top;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    size() {
        return this.heap.length;
    }

    _bubbleUp(idx) {
        const element = this.heap[idx];
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            const parent = this.heap[parentIdx];
            // So sánh f_score, nếu bằng nhau thì ưu tiên h_score nhỏ hơn (tiến gần đích hơn)
            if (element.f < parent.f || (element.f === parent.f && element.h < parent.h)) {
                this.heap[idx] = parent;
                this.heap[parentIdx] = element;
                idx = parentIdx;
            } else {
                break;
            }
        }
    }

    _sinkDown(idx) {
        const length = this.heap.length;
        const element = this.heap[idx];
        while (true) {
            let leftChildIdx = 2 * idx + 1;
            let rightChildIdx = 2 * idx + 2;
            let swapIdx = null;

            if (leftChildIdx < length) {
                const leftChild = this.heap[leftChildIdx];
                if (leftChild.f < element.f || (leftChild.f === element.f && leftChild.h < element.h)) {
                    swapIdx = leftChildIdx;
                }
            }

            if (rightChildIdx < length) {
                const rightChild = this.heap[rightChildIdx];
                const compareChild = swapIdx === null ? element : this.heap[leftChildIdx];
                if (rightChild.f < compareChild.f || (rightChild.f === compareChild.f && rightChild.h < compareChild.h)) {
                    swapIdx = rightChildIdx;
                }
            }

            if (swapIdx === null) break;
            this.heap[idx] = this.heap[swapIdx];
            this.heap[swapIdx] = element;
            idx = swapIdx;
        }
    }
}

/**
 * Lớp trừu tượng cơ sở cho thuật toán tìm kiếm đường đi
 */
export class PathfindingAlgorithm {
    constructor(name, maze, options = {}) {
        this.name = name;
        this.maze = maze;
        this.options = options;
        this.reset();
    }

    reset() {
        this.start = { ...this.maze.start };
        this.goal = { ...this.maze.goal };
        this.visited = new Map(); // key -> thứ tự duyệt hoặc {r, c, order}
        this.visitedList = [];    // Danh sách tọa độ duyệt theo thứ tự thời gian
        this.parent = new Map();  // key -> parent key
        this.path = [];           // Đường đi từ start tới goal nếu tìm thấy
        this.status = 'ready';    // 'ready' | 'running' | 'found' | 'no_path'
        this.visitedCount = 0;
        this.maxFrontier = 0;
        this.currentFrontier = 0;
        this.executionTime = 0;   // miliseconds
        this.current = null;
        this.stepCount = 0;
    }

    key(r, c) {
        return `${r},${c}`;
    }

    fromKey(k) {
        const [r, c] = k.split(',').map(Number);
        return { r, c };
    }

    reconstructPath() {
        let currKey = this.key(this.goal.r, this.goal.c);
        const path = [];
        while (currKey) {
            path.push(this.fromKey(currKey));
            currKey = this.parent.get(currKey);
        }
        this.path = path.reverse();
        return this.path;
    }

    // 4 hướng di chuyển: Trên, Phải, Dưới, Trái
    getNeighbors(r, c) {
        const dirs = [
            { dr: -1, dc: 0 }, // Lên
            { dr: 0, dc: 1 },  // Phải
            { dr: 1, dc: 0 },  // Xuống
            { dr: 0, dc: -1 }  // Trái
        ];
        const neighbors = [];
        for (const d of dirs) {
            const nr = r + d.dr;
            const nc = c + d.dc;
            if (this.maze.isWalkable(nr, nc)) {
                neighbors.push({ r: nr, c: nc });
            }
        }
        return neighbors;
    }
}

/**
 * THUẬT TOÁN BFS (Breadth-First Search - Tìm kiếm theo chiều rộng)
 * Sử dụng hàng đợi FIFO Queue
 */
export class BFSAlgorithm extends PathfindingAlgorithm {
    constructor(maze, options = {}) {
        super('BFS', maze, options);
    }

    reset() {
        super.reset();
        this.queue = [];
        const startKey = this.key(this.start.r, this.start.c);
        this.queue.push({ r: this.start.r, c: this.start.c });
        this.visited.set(startKey, 0);
        this.visitedList.push({ r: this.start.r, c: this.start.c });
        this.parent.set(startKey, null);
        this.maxFrontier = 1;
        this.currentFrontier = 1;
    }

    step() {
        if (this.status === 'found' || this.status === 'no_path') {
            return this.status;
        }
        this.status = 'running';

        if (this.queue.length === 0) {
            this.status = 'no_path';
            return this.status;
        }

        const t0 = performance.now();
        const current = this.queue.shift();
        this.current = current;
        this.visitedCount++;
        this.stepCount++;

        // Kiểm tra tới đích
        if (current.r === this.goal.r && current.c === this.goal.c) {
            this.reconstructPath();
            this.status = 'found';
            this.executionTime += (performance.now() - t0);
            return this.status;
        }

        // Mở rộng các đỉnh kề
        const neighbors = this.getNeighbors(current.r, current.c);
        const currKey = this.key(current.r, current.c);

        for (const next of neighbors) {
            const nextKey = this.key(next.r, next.c);
            if (!this.visited.has(nextKey)) {
                this.visited.set(nextKey, this.visitedList.length);
                this.visitedList.push(next);
                this.parent.set(nextKey, currKey);
                this.queue.push(next);

                // Kiểm tra đích ngay khi sinh nút (tối ưu BFS)
                if (next.r === this.goal.r && next.c === this.goal.c) {
                    this.current = next;
                    this.visitedCount++;
                    this.reconstructPath();
                    this.status = 'found';
                    this.executionTime += (performance.now() - t0);
                    return this.status;
                }
            }
        }

        this.currentFrontier = this.queue.length;
        if (this.currentFrontier > this.maxFrontier) {
            this.maxFrontier = this.currentFrontier;
        }

        this.executionTime += (performance.now() - t0);
        return this.status;
    }

    getFrontierList() {
        return this.queue;
    }
}

/**
 * THUẬT TOÁN DFS (Depth-First Search - Tìm kiếm theo chiều sâu)
 * Sử dụng ngăn xếp LIFO Stack
 */
export class DFSAlgorithm extends PathfindingAlgorithm {
    constructor(maze, options = {}) {
        super('DFS', maze, options);
    }

    reset() {
        super.reset();
        this.stack = [];
        const startKey = this.key(this.start.r, this.start.c);
        this.stack.push({ r: this.start.r, c: this.start.c });
        this.visited.set(startKey, 0);
        this.visitedList.push({ r: this.start.r, c: this.start.c });
        this.parent.set(startKey, null);
        this.maxFrontier = 1;
        this.currentFrontier = 1;
    }

    step() {
        if (this.status === 'found' || this.status === 'no_path') {
            return this.status;
        }
        this.status = 'running';

        if (this.stack.length === 0) {
            this.status = 'no_path';
            return this.status;
        }

        const t0 = performance.now();
        const current = this.stack.pop();
        this.current = current;
        this.visitedCount++;
        this.stepCount++;

        // Kiểm tra đích
        if (current.r === this.goal.r && current.c === this.goal.c) {
            this.reconstructPath();
            this.status = 'found';
            this.executionTime += (performance.now() - t0);
            return this.status;
        }

        // Lấy đỉnh kề (đẩy vào stack theo thứ tự thích hợp)
        const neighbors = this.getNeighbors(current.r, current.c);
        const currKey = this.key(current.r, current.c);

        for (const next of neighbors) {
            const nextKey = this.key(next.r, next.c);
            if (!this.visited.has(nextKey)) {
                this.visited.set(nextKey, this.visitedList.length);
                this.visitedList.push(next);
                this.parent.set(nextKey, currKey);
                this.stack.push(next);

                // Kiểm tra đích ngay khi duyệt
                if (next.r === this.goal.r && next.c === this.goal.c) {
                    this.current = next;
                    this.visitedCount++;
                    this.reconstructPath();
                    this.status = 'found';
                    this.executionTime += (performance.now() - t0);
                    return this.status;
                }
            }
        }

        this.currentFrontier = this.stack.length;
        if (this.currentFrontier > this.maxFrontier) {
            this.maxFrontier = this.currentFrontier;
        }

        this.executionTime += (performance.now() - t0);
        return this.status;
    }

    getFrontierList() {
        return this.stack;
    }
}

/**
 * THUẬT TOÁN A* (A-Star Search - Tìm kiếm Heuristic)
 * Sử dụng hàm đánh giá f(n) = g(n) + h(n)
 * Hàm Heuristic mặc định: Khoảng cách Manhattan h(n) = |r - r_g| + |c - c_g|
 */
export class AStarAlgorithm extends PathfindingAlgorithm {
    constructor(maze, options = {}) {
        super('A*', maze, options);
        this.heuristicType = options.heuristic || 'manhattan'; // 'manhattan' hoặc 'euclidean'
    }

    heuristic(r, c) {
        const dr = Math.abs(r - this.goal.r);
        const dc = Math.abs(c - this.goal.c);
        if (this.heuristicType === 'euclidean') {
            return Math.sqrt(dr * dr + dc * dc);
        }
        // Khoảng cách Manhattan chuẩn cho chuyển động 4 hướng
        return dr + dc;
    }

    reset() {
        super.reset();
        this.openHeap = new MinHeap();
        this.gScore = new Map(); // key -> chi phí từ start
        this.closedSet = new Set(); // Các nút đã hoàn thành mở rộng

        const startKey = this.key(this.start.r, this.start.c);
        const h0 = this.heuristic(this.start.r, this.start.c);
        this.gScore.set(startKey, 0);
        this.openHeap.push({
            r: this.start.r,
            c: this.start.c,
            g: 0,
            h: h0,
            f: h0
        });
        this.parent.set(startKey, null);
        this.maxFrontier = 1;
        this.currentFrontier = 1;
    }

    step() {
        if (this.status === 'found' || this.status === 'no_path') {
            return this.status;
        }
        this.status = 'running';

        if (this.openHeap.isEmpty()) {
            this.status = 'no_path';
            return this.status;
        }

        const t0 = performance.now();
        const current = this.openHeap.pop();
        const currKey = this.key(current.r, current.c);

        // Bỏ qua nếu nút đã được đóng với chi phí tốt hơn
        if (this.closedSet.has(currKey)) {
            this.executionTime += (performance.now() - t0);
            return this.status;
        }

        this.closedSet.add(currKey);
        this.current = current;
        this.visitedCount++;
        this.stepCount++;

        if (!this.visited.has(currKey)) {
            this.visited.set(currKey, this.visitedList.length);
            this.visitedList.push({ r: current.r, c: current.c });
        }

        // Kiểm tra đích
        if (current.r === this.goal.r && current.c === this.goal.c) {
            this.reconstructPath();
            this.status = 'found';
            this.executionTime += (performance.now() - t0);
            return this.status;
        }

        // Mở rộng lân cận
        const neighbors = this.getNeighbors(current.r, current.c);
        const tentativeG = (this.gScore.get(currKey) || 0) + 1;

        for (const next of neighbors) {
            const nextKey = this.key(next.r, next.c);
            if (this.closedSet.has(nextKey)) continue;

            const existingG = this.gScore.has(nextKey) ? this.gScore.get(nextKey) : Infinity;

            if (tentativeG < existingG) {
                this.parent.set(nextKey, currKey);
                this.gScore.set(nextKey, tentativeG);
                const h = this.heuristic(next.r, next.c);
                const f = tentativeG + h;

                this.openHeap.push({
                    r: next.r,
                    c: next.c,
                    g: tentativeG,
                    h: h,
                    f: f
                });

                if (!this.visited.has(nextKey)) {
                    this.visited.set(nextKey, this.visitedList.length);
                    this.visitedList.push(next);
                }
            }
        }

        this.currentFrontier = this.openHeap.size();
        if (this.currentFrontier > this.maxFrontier) {
            this.maxFrontier = this.currentFrontier;
        }

        this.executionTime += (performance.now() - t0);
        return this.status;
    }

    getFrontierList() {
        return this.openHeap.heap;
    }
}

/**
 * ĐIỀU PHỐI VIÊN CHẠY ĐỒNG BỘ 3 THUẬT TOÁN (Parallel Simulation Runner)
 * Đảm bảo 3 thuật toán nhận cùng trạng thái bản đồ và tiến hành từng bước song song
 */
export class SimulationController {
    constructor(maze, options = {}) {
        this.maze = maze;
        this.options = options;
        this.speed = options.speed || 50; // số bước mỗi lần tick hoặc ms delay
        this.isRunning = false;
        this.animationFrameId = null;
        this.onTick = options.onTick || null;
        this.onComplete = options.onComplete || null;

        this.initAlgorithms();
    }

    initAlgorithms() {
        this.bfs = new BFSAlgorithm(this.maze);
        this.dfs = new DFSAlgorithm(this.maze);
        this.astar = new AStarAlgorithm(this.maze, { heuristic: this.options.heuristic || 'manhattan' });
        this.algorithms = [this.bfs, this.dfs, this.astar];
    }

    reset() {
        this.pause();
        this.algorithms.forEach(algo => algo.reset());
        if (this.onTick) this.onTick(this.getMetrics());
    }

    start() {
        if (this.isAllFinished()) {
            this.reset();
        }
        this.isRunning = true;
        this.loop();
    }

    pause() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    isAllFinished() {
        return this.algorithms.every(algo => algo.status === 'found' || algo.status === 'no_path');
    }

    // Tiến hành đúng 1 bước cho cả 3 thuật toán
    step() {
        let anyActive = false;
        for (const algo of this.algorithms) {
            if (algo.status !== 'found' && algo.status !== 'no_path') {
                algo.step();
                anyActive = true;
            }
        }
        if (this.onTick) this.onTick(this.getMetrics());
        if (!anyActive && this.onComplete) {
            this.onComplete(this.getMetrics());
        }
        return anyActive;
    }

    // Chạy hoàn thành tức thì (Instant Solve) - Đo đạc thời gian chuẩn xác
    solveInstant() {
        this.pause();
        this.reset();

        for (const algo of this.algorithms) {
            const startPerf = performance.now();
            while (algo.status !== 'found' && algo.status !== 'no_path') {
                algo.step();
            }
            algo.executionTime = performance.now() - startPerf;
        }

        if (this.onTick) this.onTick(this.getMetrics());
        if (this.onComplete) this.onComplete(this.getMetrics());
    }

    setSpeed(speedVal) {
        // speedVal từ 1 đến 100
        this.speed = speedVal;
    }

    setHeuristic(type) {
        this.options.heuristic = type;
        this.astar.heuristicType = type;
    }

    loop() {
        if (!this.isRunning) return;

        // Tính số bước cần thực hiện trong 1 frame animation dựa trên tốc độ
        // Nếu tốc độ nhỏ: 1 bước mỗi N frame; nếu tốc độ lớn: nhiều bước trong 1 frame
        let stepsPerFrame = 1;
        if (this.speed <= 20) {
            stepsPerFrame = 1;
        } else if (this.speed <= 50) {
            stepsPerFrame = Math.floor((this.speed - 20) / 5) + 1;
        } else if (this.speed <= 80) {
            stepsPerFrame = Math.floor((this.speed - 50) * 0.5) + 8;
        } else {
            stepsPerFrame = Math.floor((this.speed - 80) * 2) + 25;
        }

        let stillRunning = false;
        for (let s = 0; s < stepsPerFrame; s++) {
            for (const algo of this.algorithms) {
                if (algo.status !== 'found' && algo.status !== 'no_path') {
                    algo.step();
                    stillRunning = true;
                }
            }
            if (!stillRunning) break;
        }

        if (this.onTick) this.onTick(this.getMetrics());

        if (stillRunning) {
            // Điều chỉnh throttle nếu ở tốc độ rất chậm (1 - 10)
            if (this.speed < 15) {
                setTimeout(() => {
                    if (this.isRunning) {
                        this.animationFrameId = requestAnimationFrame(() => this.loop());
                    }
                }, (15 - this.speed) * 35);
            } else {
                this.animationFrameId = requestAnimationFrame(() => this.loop());
            }
        } else {
            this.isRunning = false;
            if (this.onComplete) this.onComplete(this.getMetrics());
        }
    }

    getMetrics() {
        return this.algorithms.map(algo => ({
            name: algo.name,
            status: algo.status,
            visitedCount: algo.visitedCount,
            visitedPercent: ((algo.visitedCount / (this.maze.rows * this.maze.cols)) * 100).toFixed(1),
            pathLength: algo.path.length,
            pathCost: algo.path.length > 0 ? algo.path.length - 1 : 0,
            maxFrontier: algo.maxFrontier,
            currentFrontier: algo.currentFrontier,
            executionTime: algo.executionTime.toFixed(2), // ms
            stepCount: algo.stepCount
        }));
    }
}
