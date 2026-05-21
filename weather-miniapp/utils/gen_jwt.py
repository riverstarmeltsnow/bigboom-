"""
生成 QWeather JWT Token（Ed25519 / EdDSA）
用法：python gen_jwt.py > jwt_token.txt
然后把 jwt_token.txt 的内容复制到 weather.js 的 JWT_TOKEN 常量

注意：Token 最长有效期 24 小时，过期后需要重新生成。
"""

import jwt
import time
from pathlib import Path

# ====== 配置 ======
CREDENTIAL_ID = "T6H2HR3Y5N"          # 和风控制台的凭据 ID
PROJECT_ID = "2JDXGQKWFQ"             # 和风控制台的项目 ID
PRIVATE_KEY_FILE = "jwt_private.key"  # Ed25519 私钥路径
TOKEN_EXPIRY_HOURS = 24               # 有效期（最长 24 小时）
OUTPUT_FILE = "jwt_token.txt"         # 输出文件
# ==================

key_path = Path(__file__).parent / PRIVATE_KEY_FILE
private_key = key_path.read_text()

now = int(time.time())
payload = {
    "sub": PROJECT_ID,
    "iat": now,
    "exp": now + TOKEN_EXPIRY_HOURS * 3600,
}

# headers 需要包含 kid（凭据 ID）
headers = {
    "kid": CREDENTIAL_ID,
}

token = jwt.encode(payload, private_key, algorithm="EdDSA", headers=headers)

# 输出
print("=" * 55)
print("JWT Token 生成成功")
print(f"  项目ID (sub): {PROJECT_ID}")
print(f"  凭据ID (kid): {CREDENTIAL_ID}")
print(f"  有效期: {TOKEN_EXPIRY_HOURS} 小时")
print(f"  过期时间: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(now + TOKEN_EXPIRY_HOURS * 3600))}")
print("=" * 55)
print()
print(token)

# 写入文件
output_path = Path(__file__).parent / OUTPUT_FILE
output_path.write_text(token + "\n")
print(f"\n已保存到: {output_path}")
print()
print("下一步：将上面的 token 复制到 weather.js 的 JWT_TOKEN 常量中")
