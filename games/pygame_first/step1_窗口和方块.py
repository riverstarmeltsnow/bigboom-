"""
第一个 pygame 程序：显示窗口 + 一个会动的方块
每行都有注释，看不懂的随时问我
"""

import pygame
import sys

# === 初始化 ===
pygame.init()

# === 创建窗口 ===
WINDOW_WIDTH = 600   # 窗口宽度
WINDOW_HEIGHT = 400  # 窗口高度
screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption("我的第一个游戏")

# === 方块的数据 ===
# 方块的位置和大小，用一个矩形表示
player = pygame.Rect(100, 100, 100, 50)  # (x坐标, y坐标, 宽度, 高度)
player_color = (0, 0, 255)              # RGB颜色：红色
move_speed = 10                          # 每次按键移动的像素数

# === 时钟（控制游戏速度） ===
clock = pygame.time.Clock()

# === 游戏主循环 ===
# while True 表示一直运行，直到遇到退出事件
while True:
    # ---- 1. 处理事件（键盘、鼠标、关闭窗口等） ----
    for event in pygame.event.get():
        if event.type == pygame.QUIT:          # 点了关闭按钮
            pygame.quit()
            sys.exit()

    # ---- 2. 读取键盘状态，移动方块 ----
    keys = pygame.key.get_pressed()  # 获取所有按键的状态
    if keys[pygame.K_LEFT] or keys[pygame.K_a]:   # 左箭头 或 A 键
        player.x -= move_speed
    if keys[pygame.K_RIGHT] or keys[pygame.K_d]:  # 右箭头 或 D 键
        player.x += move_speed
    if keys[pygame.K_UP] or keys[pygame.K_w]:     # 上箭头 或 W 键
        player.y -= move_speed
    if keys[pygame.K_DOWN] or keys[pygame.K_s]:   # 下箭头 或 S 键
        player.y += move_speed

    # ---- 3. 防止方块跑出窗口边界 ----
    player.x = max(0, min(player.x, WINDOW_WIDTH - player.width))
    player.y = max(0, min(player.y, WINDOW_HEIGHT - player.height))

    # ---- 4. 绘制画面 ----
    screen.fill((0, 0, 0))       # 用黑色清空窗口（不清理会留下残影）
    pygame.draw.rect(screen, player_color, player)  # 画红色方块
    pygame.display.flip()        # 把绘制的画面显示到屏幕上

    # ---- 5. 控制帧率（每秒60帧） ----
    clock.tick(60)
