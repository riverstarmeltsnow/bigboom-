"""生成游戏音效（不需要外部文件）"""
import wave
import struct
import math

def save_wav(filename, samples, sample_rate=22050):
    """把音频数据保存为 .wav 文件"""
    with wave.open(filename, 'w') as wf:
        wf.setnchannels(1)          # 单声道
        wf.setsampwidth(2)          # 16位采样
        wf.setframerate(sample_rate)
        for s in samples:
            wf.writeframes(struct.pack('<h', int(s * 32767)))

def make_tone(freq, duration, sample_rate=22050):
    """生成一个固定频率的正弦波"""
    samples = []
    for i in range(int(sample_rate * duration)):
        t = i / sample_rate
        samples.append(math.sin(2 * math.pi * freq * t))
    return samples

def make_chirp(start_freq, end_freq, duration, sample_rate=22050):
    """生成频率从低到高的音效（收集金币效果）"""
    samples = []
    for i in range(int(sample_rate * duration)):
        t = i / sample_rate
        freq = start_freq + (end_freq - start_freq) * (t / duration)
        samples.append(math.sin(2 * math.pi * freq * t))
    return samples

def make_noise(duration, intensity=0.5, sample_rate=22050):
    """生成噪声（撞击效果）"""
    samples = []
    for i in range(int(sample_rate * duration)):
        t = i / sample_rate
        # 白噪声乘以指数衰减
        samples.append(intensity * (random.random() * 2 - 1) * math.exp(-t * 5))
    return samples

import random

# 生成收集音效（轻快的上升音）
collect_sound = make_chirp(400, 1200, 0.15)
save_wav("sound_collect.wav", collect_sound)

# 生成受伤音效（低频噪声）
hurt_sound = make_noise(0.3, 0.6)
save_wav("sound_hurt.wav", hurt_sound)

print("音效文件已生成！")
