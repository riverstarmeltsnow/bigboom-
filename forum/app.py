"""
Flask 留言板 - 后端主程序（SQLite 版）
功能：发帖、查看列表、查看详情、回复
"""

import sqlite3
import os
from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = "myclaude_forum_secret_key"

# 数据库文件路径（和 app.py 同目录）
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "forum.db")


def get_db():
    """获取数据库连接（每次调用返回新连接，用完后必须关闭）"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # 让查询结果支持按列名访问
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """初始化数据库表（首次运行自动创建）"""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            nickname TEXT NOT NULL DEFAULT '匿名',
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS replies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            nickname TEXT NOT NULL DEFAULT '匿名',
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
        )
    """)
    conn.commit()
    conn.close()
    print("[OK] 数据库初始化完成（forum.db）")


# ===================== 路由 =====================


@app.route("/")
def index():
    """帖子列表页"""
    page = request.args.get("page", 1, type=int)
    per_page = 10
    offset = (page - 1) * per_page

    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) AS total FROM posts")
    total = cur.fetchone()["total"]

    cur.execute(
        "SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?",
        (per_page, offset),
    )
    posts = cur.fetchall()
    conn.close()

    total_pages = (total + per_page - 1) // per_page
    return render_template(
        "index.html", posts=posts, page=page, total_pages=total_pages
    )


@app.route("/post/<int:post_id>")
def post_detail(post_id):
    """帖子详情页"""
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM posts WHERE id = ?", (post_id,))
    post = cur.fetchone()
    if not post:
        conn.close()
        flash("帖子不存在", "error")
        return redirect(url_for("index"))

    cur.execute(
        "SELECT * FROM replies WHERE post_id = ? ORDER BY created_at ASC",
        (post_id,),
    )
    replies = cur.fetchall()
    conn.close()
    return render_template("post.html", post=post, replies=replies)


@app.route("/new", methods=["GET", "POST"])
def new_post():
    """发帖"""
    if request.method == "POST":
        title = request.form.get("title", "").strip()
        content = request.form.get("content", "").strip()
        nickname = request.form.get("nickname", "").strip() or "匿名"

        # 简单校验
        errors = []
        if not title:
            errors.append("标题不能为空")
        if len(title) > 200:
            errors.append("标题不能超过200字")
        if not content:
            errors.append("内容不能为空")
        if len(nickname) > 50:
            errors.append("昵称不能超过50字")

        if errors:
            for e in errors:
                flash(e, "error")
            return render_template("new_post.html", title=title, content=content, nickname=nickname)

        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO posts (title, content, nickname) VALUES (?, ?, ?)",
            (title, content, nickname),
        )
        post_id = cur.lastrowid
        conn.commit()
        conn.close()
        flash("发布成功！", "success")
        return redirect(url_for("post_detail", post_id=post_id))

    return render_template("new_post.html", title="", content="", nickname="")


@app.route("/reply/<int:post_id>", methods=["POST"])
def reply(post_id):
    """回复帖子"""
    content = request.form.get("content", "").strip()
    nickname = request.form.get("nickname", "").strip() or "匿名"

    if not content:
        flash("回复内容不能为空", "error")
        return redirect(url_for("post_detail", post_id=post_id))

    if len(nickname) > 50:
        flash("昵称不能超过50字", "error")
        return redirect(url_for("post_detail", post_id=post_id))

    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT id FROM posts WHERE id = ?", (post_id,))
    if not cur.fetchone():
        conn.close()
        flash("帖子不存在", "error")
        return redirect(url_for("index"))

    cur.execute(
        "INSERT INTO replies (post_id, content, nickname) VALUES (?, ?, ?)",
        (post_id, content, nickname),
    )
    conn.commit()
    conn.close()
    flash("回复成功！", "success")
    return redirect(url_for("post_detail", post_id=post_id))


# ===================== 启动 =====================

if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
