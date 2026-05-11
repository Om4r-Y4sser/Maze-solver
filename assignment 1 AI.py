import matplotlib.pyplot as plt
import numpy as np
from collections import deque
from scipy.ndimage import gaussian_filter
from skimage.morphology import remove_small_objects

def image_to_maze(image_path, blur_sigma=0.5, wall_threshold=0.65, min_object_size=30):
    """
    Converts image to binary. 
    Dark pixels (< threshold) are Walls (1). Light pixels are Paths (0).
    """
    try:
        img = plt.imread(image_path)
    except FileNotFoundError:
        if image_path.endswith('.jpg'): img = plt.imread(image_path.replace('.jpg', '.jpeg'))
        elif image_path.endswith('.jpeg'): img = plt.imread(image_path.replace('.jpeg', '.jpg'))
        else: raise

    if img.ndim == 3:
        if img.shape[2] == 4:
            img = img[:, :, :3]
        gray = np.mean(img, axis=2)
    else:
        gray = img
        
    if gray.max() > 1.0:
        gray /= 255.0

    gray = gaussian_filter(gray, sigma=blur_sigma)

    binary = gray < wall_threshold 
    
    binary = remove_small_objects(binary, min_size=min_object_size)
    
    binary = ~remove_small_objects(~binary, min_size=min_object_size)
    
    coords = np.argwhere(binary == 1)
    if coords.size > 0:
        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)
        print(f"   Debug: Auto-cropped maze to size {y_max-y_min}x{x_max-x_min}")
        binary = binary[y_min:y_max+1, x_min:x_max+1]
        
    return binary.astype(int)

def maze_to_graph(maze):
    rows, cols = len(maze), len(maze[0])
    graph = {}
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    
    for i in range(rows):
        for j in range(cols):
            if maze[i][j] == 0:
                neighbors = []
                for di, dj in directions:
                    ni, nj = i + di, j + dj
                    if 0 <= ni < rows and 0 <= nj < cols and maze[ni][nj] == 0:
                        neighbors.append((ni, nj))
                graph[(i, j)] = neighbors
    return graph

def bfs(graph, start, goal):
    queue = deque([(start, [start])])
    visited = set([start])
    
    while queue:
        current, path = queue.popleft()
        
        if current == goal: return path
        
        for neighbor in graph.get(current, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    return None

def dfs(graph, start, goal):
    stack = [(start, [start])]
    visited = set([start])
    
    while stack:
        current, path = stack.pop()
        if current == goal: return path
        
        for neighbor in reversed(graph.get(current, [])): 
            if neighbor not in visited:
                visited.add(neighbor)
                stack.append((neighbor, path + [neighbor]))
    return None

def get_closest_path_cell(maze, r, c):
    """If user clicks a wall, find the nearest open path cell."""
    if maze[r][c] == 0: return (r, c)
    max_dist = 10
    for d in range(1, max_dist):
        for dr in range(-d, d+1):
            for dc in range(-d, d+1):
                nr, nc = r + dr, c + dc
                if 0 <= nr < len(maze) and 0 <= nc < len(maze[0]):
                    if maze[nr][nc] == 0:
                        return (nr, nc)
    return (r, c)

if __name__ == "__main__":
    image_path = "maze.jpg"
    
    print("1. Processing Image...")
    try:
        maze = image_to_maze(image_path)
    except Exception as e:
        print(f"Error: Could not load image. {e}")
        exit()

    print("\n---------------------------------------------------")
    print("INSTRUCTIONS:")
    print("1. A window will pop up showing the maze.")
    print("2. CLICK TWO POINTS: First for START, Second for GOAL.")
    print("   (Click on the WHITE paths, not the black walls)")
    print("---------------------------------------------------\n")
    
    
    plt.figure(figsize=(10, 10))
    plt.imshow(maze, cmap='gray_r')
    plt.title("CLICK 2 POINTS: Start (1st) -> Goal (2nd)")
    
    # Get 2 clicks from user
    pts = plt.ginput(2, timeout=-1)
    plt.close()
    
    if len(pts) < 2:
        print("Error: You didn't click two points!")
    else:
        start_click = (int(pts[0][1]), int(pts[0][0]))
        goal_click = (int(pts[1][1]), int(pts[1][0]))
        
        start = get_closest_path_cell(maze, start_click[0], start_click[1])
        goal = get_closest_path_cell(maze, goal_click[0], goal_click[1])
        
        print(f"Selected Start: {start}")
        print(f"Selected Goal:  {goal}")

        print("2. Building Graph...")
        graph = maze_to_graph(maze)
        
        print("3. Solving BFS...")
        bfs_path = bfs(graph, start, goal)

        print("4. Solving DFS...")
        dfs_path = dfs(graph, start, goal)
        
        if bfs_path or dfs_path:
            fig, axes = plt.subplots(1, 2, figsize=(14, 7))
            axes[0].imshow(maze, cmap='gray_r')
            axes[0].set_title(f"BFS Solution (Queue)\nLength: {len(bfs_path) if bfs_path else 'None'}")
            axes[0].axis('off')
            if bfs_path:
                py = [p[0] for p in bfs_path]
                px = [p[1] for p in bfs_path]
                axes[0].plot(px, py, color='red', linewidth=2, label='BFS Path')
                axes[0].scatter(start[1], start[0], color='lime', s=100, label='Start')
                axes[0].scatter(goal[1], goal[0], color='blue', s=100, label='Goal')
                axes[0].legend()

            # Plot DFS
            axes[1].imshow(maze, cmap='gray_r')
            axes[1].set_title(f"DFS Solution (Stack)\nLength: {len(dfs_path) if dfs_path else 'None'}")
            axes[1].axis('off')
            if dfs_path:
                py = [p[0] for p in dfs_path]
                px = [p[1] for p in dfs_path]
                axes[1].plot(px, py, color='purple', linewidth=2, label='DFS Path')
                axes[1].scatter(start[1], start[0], color='lime', s=100)
                axes[1].scatter(goal[1], goal[0], color='blue', s=100)
                axes[1].legend()

            plt.tight_layout()
            plt.show()
        else:
            print("   No path found. Are the start/goal connected?")