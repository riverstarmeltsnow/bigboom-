"""
第二个程序：控制方块去吃目标，吃到后目标刷新位置
"""

import pygame
import sys
import random  # 用来生成随机数

# === 初始化 ===
pygame.init()

# === 创建窗口 ===
WINDOW_WIDTH = 600
WINDOW_HEIGHT = 400
screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption("吃掉目标！")

# === 玩家方块（红色） ===
player = pygame.Rect(100, 100, 50, 50)
player_color = (255, 255, 0)
move_speed = 3

# === 目标方块（绿色） ===
target = pygame.Rect(300, 200, 100, 50)  # 初始位置在窗口中央附近
target_color = (0, 255, 0)

clock = pygame.time.Clock()
score = 0
lives = 3
  # 计分

# === 游戏主循环 ===
while True:
    # ---- 1. 处理事件 ----
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

    # ---- 2. 键盘控制玩家移动 ----
    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT] or keys[pygame.K_a]:
        player.x -= move_speed
    if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
        player.x += move_speed
    if keys[pygame.K_UP] or keys[pygame.K_w]:
        player.y -= move_speed
    if keys[pygame.K_DOWN] or keys[pygame.K_s]:
        player.y += move_speed

    # ---- 3. 边界限制 ----
    player.x = max(0, min(player.x, WINDOW_WIDTH - player.width))
    player.y = max(0, min(player.y, WINDOW_HEIGHT - player.height))

    # ---- 4. 碰撞检测：玩家碰到了目标 ----
    # colliderect 判断两个矩形是否重叠
    if player.colliderect(target):
        # 把目标移到窗口内的随机位置
        target.x = random.randint(0, WINDOW_WIDTH - target.width)
        target.y = random.randint(0, WINDOW_HEIGHT - target.height)
        score += 1  # 分数加1
        player.width +=5
        player.height += 5 
        print(f"得分: {score}")  # 在终端显示分数

    # ---- 5. 绘制画面 ----
    screen.fill((0, 0, 0))           # 黑色背景
    pygame.draw.rect(screen, target_color, target)   # 画绿色目标
    pygame.draw.rect(screen, player_color, player)   # 画红色玩家
    pygame.display.flip()

    clock.tick(60)
