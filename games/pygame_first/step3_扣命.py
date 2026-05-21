"""
第三个程序：玩家吃目标加分，碰到敌人扣命
"""

import pygame
import sys
import random

pygame.init()
pygame.mixer.init()  # 初始化音频

# === 窗口 ===
WINDOW_WIDTH = 600
WINDOW_HEIGHT = 400
screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption("碰敌人会扣命！")

# === 玩家 ===
player = pygame.Rect(100, 100, 50, 50)
player_color = (255, 255, 0)
move_speed = 5

# === 目标（加分） ===
target = pygame.Rect(300, 200, 40, 40)
target_color = (0, 255, 0)

# === 敌人 ===
# 敌人不止一个，用列表存
enemies = []
for i in range(5):
    # 每个敌人放在窗口的不同位置
    enemy = pygame.Rect(
        random.randint(0, WINDOW_WIDTH - 40),
        random.randint(0, WINDOW_HEIGHT - 40),
        40, 40
    )
    enemies.append(enemy)


enemy_color = (255, 0, 0)     # 敌人红色

# === 游戏状态 ===
score = 0
lives = 2
last_spawn_threshold = 0  # 记录上次生成敌人的分数门槛
clock = pygame.time.Clock()

# 用来在窗口上显示文字的字体
font = pygame.font.Font(None, 36)  # None=默认字体, 36=字号

# === 音效 ===
sound_collect = pygame.mixer.Sound("sound_collect.wav")
sound_hurt = pygame.mixer.Sound("sound_hurt.wav")

while True:
    # ---- 1. 事件处理 ----
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

    # ---- 2. 玩家移动 ----
    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT] or keys[pygame.K_a]:
        player.x -= move_speed
    if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
        player.x += move_speed
    if keys[pygame.K_UP] or keys[pygame.K_w]:
        player.y -= move_speed
    if keys[pygame.K_DOWN] or keys[pygame.K_s]:
        player.y += move_speed

    # 边界限制
    player.x = max(0, min(player.x, WINDOW_WIDTH - player.width))
    player.y = max(0, min(player.y, WINDOW_HEIGHT - player.height))

    # ---- 3. 敌人自动移动 ----
    for enemy in enemies:
        # 每个敌人随机方向移动一点点
        enemy.x += random.choice([-2, -1, 0, 1, 2,3])
        enemy.y += random.choice([-2, -1, 0, 1, 2,3])
        # 不让敌人跑出窗口
        enemy.x = max(0, min(enemy.x, WINDOW_WIDTH - enemy.width))
        enemy.y = max(0, min(enemy.y, WINDOW_HEIGHT - enemy.height))

    # ---- 4. 碰撞检测 ----
    # 吃到目标 → 加分
    if player.colliderect(target):
        target.x = random.randint(0, WINDOW_WIDTH - target.width)
        target.y = random.randint(0, WINDOW_HEIGHT - target.height)
        score += 1
        sound_collect.play()  # 播放收集音效

        # 每得5分生成一个新敌人
        if score // 5 > last_spawn_threshold:
            last_spawn_threshold = score // 5
            new_enemy = pygame.Rect(
                random.randint(0, WINDOW_WIDTH - 40),
                random.randint(0, WINDOW_HEIGHT - 40),
                40, 40
            )
            enemies.append(new_enemy)

    # 碰到任意敌人 → 扣命
    for enemy in enemies:
        if player.colliderect(enemy):
            lives -= 1
            sound_hurt.play()  # 播放受伤音效
            # 扣命后把玩家重置到左上角
            player.x = 50
            player.y = 50
            break  # 一次只扣一条命，跳出循环

    # ---- 5. 游戏结束判断 ----
    if lives <= 0:
        # 显示游戏结束文字，然后退出
        screen.fill((0, 0, 0))
        game_over_text = font.render("游戏结束！", True, (255, 255, 255))
        screen.blit(game_over_text, (WINDOW_WIDTH // 2 - 80, WINDOW_HEIGHT // 2))
        pygame.display.flip()
        pygame.time.wait(2000)  # 等2秒
        pygame.quit()
        sys.exit()

    # ---- 6. 绘制画面 ----
    screen.fill((0, 0, 0))

    # 画目标
    pygame.draw.rect(screen, target_color, target)

    # 画敌人
    for enemy in enemies:
        pygame.draw.rect(screen, enemy_color, enemy)

    # 画玩家
    pygame.draw.rect(screen, player_color, player)

    # 显示分数和命数（文字）
    text = font.render(f"得分: {score}   命: {lives}", True, (255, 255, 255))
    screen.blit(text, (10, 10))  # 在左上角显示

    pygame.display.flip()
    clock.tick(60)
