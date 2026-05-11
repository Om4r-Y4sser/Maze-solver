import matplotlib.pyplot as plt
import numpy as np
from collections import deque
from scipy.ndimage import gaussian_filter
from skimage.morphology import remove_small_objects

# --- 1. Image Processing ---
def image_to_maze(image_path, blur_sigma=0.5, wall_threshold=0.65, min_object_size=30):
    """
    Converts image to binary. 
    Dark pixels (< threshold) are Walls (1). Light pixels are Paths (0).
    """
    # Load
    try:
        img = plt.imread(image_path)
    except FileNotFoundError:
        # Fallback for common extensions
        if image_path.endswith('.jpg'): img = plt.imread(image_path.replace('.jpg', '.jpeg'))
        elif image_path.endswith('.jpeg'): img = plt.imread(image_path.replace('.jpeg', '.jpg'))
        else: raise

    # Grayscale
    if img.ndim == 3:
        if img.shape[2] == 4:
            img = img[:, :, :3] # Drop Alpha channel if present
        gray = np.mean(img, axis=2)
    else:
        gray = img
        
    # Normalize
    if gray.max() > 1.0:
        gray /= 255.0

    # --- FIX APPLIED HERE ---
    # 1. Blur FIRST to smooth out noise (dust/grain)
    gray = gaussian_filter(gray, sigma=blur_sigma)

    # 2. THEN Threshold based on the clean image
    binary = gray < wall_threshold 
    # ------------------------
    
    # Clean Noise (Remove isolated small walls)
    binary = remove_small_objects(binary, min_size=min_object_size)
    
    # Clean Noise (Fill small holes in walls)
    # This inverts the image, removes small "objects" (holes), and inverts back
    binary = ~remove_small_objects(~binary, min_size=min_object_size)
    
    # Smart Crop (Remove empty white borders)
    coords = np.argwhere(binary == 1)
    if coords.size > 0:
        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)
        print(f"   Debug: Auto-cropped maze to size {y_max-y_min}x{x_max-x_min}")
        binary = binary[y_min:y_max+1, x_min:x_max+1]
        
    return binary.astype(int)

# --- 2. Solver Functions ---
def maze_to_graph(maze):
    rows, cols = len(maze), len(maze[0])
    graph = {}
    # Directions: Up, Down, Left, Right
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    
    for i in range(rows):
        for j in range(cols):
            if maze[i][j] == 0: # 0 is Path
                neighbors = []
                for di, dj in directions:
                    ni, nj = i + di, j + dj
                    # Check Bounds AND if neighbor is a Path
                    if 0 <= ni < rows and 0 <= nj < cols and maze[ni][nj] == 0:
                        neighbors.append((ni, nj))
                graph[(i, j)] = neighbors
    return graph

def bfs(graph, start, goal):
    # Queue for BFS (FIFO)
    queue = deque([(start, [start])])
    visited = set([start])
    
    while queue:
        current, path = queue.popleft() # Pop form Left (Oldest)
        
        if current == goal: return path
        
        for neighbor in graph.get(current, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    return None

def dfs(graph, start, goal):
    # Stack for DFS (LIFO)
    stack = [(start, [start])]
    visited = set([start])
    
    while stack:
        current, path = stack.pop() # Pop from Right (Newest)
        
        if current == goal: return path
        
        for neighbor in reversed(graph.get(current, [])): 
            if neighbor not in visited:
                visited.add(neighbor)
                stack.append((neighbor, path + [neighbor]))
    return None

def get_closest_path_cell(maze, r, c):
    """If user clicks a wall, find the nearest open path cell."""
    if maze[r][c] == 0: return (r, c)
    
    # Search outwards in a box pattern
    max_dist = 10
    for d in range(1, max_dist):
        for dr in range(-d, d+1):
            for dc in range(-d, d+1):
                nr, nc = r + dr, c + dc
                if 0 <= nr < len(maze) and 0 <= nc < len(maze[0]):
                    if maze[nr][nc] == 0:
                        return (nr, nc)
    return (r, c)

# --- Main Execution ---
if __name__ == "__main__":
    # Ensure this file exists in your folder!
    image_path = "maze.jpg"
    
    print("1. Processing Image...")
    try:
        maze = image_to_maze(image_path)
    except Exception as e:
        print(f"Error: Could not load image. {e}")
        exit()

    # --- INTERACTIVE SELECTION ---
    print("\n---------------------------------------------------")
    print("INSTRUCTIONS:")
    print("1. A window will pop up showing the maze.")
    print("2. CLICK TWO POINTS: First for START, Second for GOAL.")
    print("   (Click on the WHITE paths, not the black walls)")
    print("---------------------------------------------------\n")
    
    # If using Jupyter/VS Code, ensure backend is interactive
    # You might need %matplotlib qt in the cell above this script
    
    plt.figure(figsize=(10, 10))
    plt.imshow(maze, cmap='gray_r') # White=Path, Black=Wall
    plt.title("CLICK 2 POINTS: Start (1st) -> Goal (2nd)")
    
    # Get 2 clicks from user
    pts = plt.ginput(2, timeout=-1)
    plt.close()
    
    if len(pts) < 2:
        print("Error: You didn't click two points!")
    else:
        # Swap coordinates because Image is (Row, Col) but Plot is (X, Y)
        start_click = (int(pts[0][1]), int(pts[0][0]))
        goal_click = (int(pts[1][1]), int(pts[1][0]))
        
        # Snap to nearest white pixel if user clicked a black wall
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
        
        # --- VISUALIZATION (Side by Side) ---
        if bfs_path or dfs_path:
            fig, axes = plt.subplots(1, 2, figsize=(14, 7))
            
            # Plot BFS
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