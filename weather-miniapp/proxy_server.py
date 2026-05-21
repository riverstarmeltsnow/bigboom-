"""
和风天气 API 代理服务器
用法：python proxy_server.py
然后在微信开发者工具里运行小程序

这个代理把 API Key 放在服务端，避免暴露在前端代码中。
"""

import http.server
import json
import urllib.request
import urllib.parse

# ====== 配置 ======
PORT = 8080
API_KEY = '7762292823f949009455cdc614177413'
BASE_URL = 'https://mj3tehy45d.re.qweatherapi.com'
# =================

class ProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # 解析请求路径和参数
            parsed = urllib.parse.urlparse(self.path)
            path = parsed.path
            params = urllib.parse.parse_qs(parsed.query)

            # 拼接目标 URL，加上 API Key
            params['key'] = [API_KEY]
            query = urllib.parse.urlencode(params, doseq=True)
            target_url = f'{BASE_URL}{path}?{query}'

            print(f'[代理] 请求: {target_url}')

            # 转发请求到和风天气
            req = urllib.request.Request(target_url)
            req.add_header('User-Agent', 'Weather-Proxy/1.0')
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = resp.read()
                status = resp.status

            # 设置 CORS 头（允许小程序跨域）
            self.send_response(status)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', '*')
            self.end_headers()
            self.wfile.write(data)

            print(f'[代理] 响应: {status}')

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            error = json.dumps({'error': str(e)}).encode('utf-8')
            self.wfile.write(error)
            print(f'[代理] 错误: {e}')

    def do_OPTIONS(self):
        # 预检请求
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

print(f'和风天气代理服务器启动在 http://localhost:{PORT}')
print('按 Ctrl+C 停止')
server = http.server.HTTPServer(('0.0.0.0', PORT), ProxyHandler)
server.serve_forever()
