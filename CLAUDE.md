# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 关于用户
- 何鑫，学生，AI 工具新手，正在学习成为程序员
- 用此项目做：小游戏开发、代码生成、文档/PPT 生成

## 通用规范

### 技术栈
- Python 3.12+
- 游戏开发：C++ (Win32/GDI) — 编译器用 VS2022 MSVC (`cl.exe`)
- PPT 生成：python-pptx
- 文档生成：python-docx

### C++ 编译方式
```
# 打开 VS2022 开发者命令提示符，或运行：
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x86_amd64
cl.exe /utf-8 /std:c++20 /EHsc /Fe:目标.exe 源文件.cpp /link user32.lib gdi32.lib
```

### 项目结构
```
d:/myclaude/
├── games/         # 游戏项目（每个游戏独立子目录）
├── ppt/           # PPT 生成脚本
├── reports/       # 实验报告生成
│   ├── _规范.md              # 报告生成规范文档
│   ├── convert_wps2.vbs      # WPS .doc→.docx 转换脚本
│   ├── generate_report.py    # 实验报告生成脚本
│   ├── templates/            # 模板文件（.docx / .doc）
│   ├── images/               # 截图
│   └── output/               # 生成输出
└── utils/         # 通用工具函数
```

### 代码规范
- 代码添加详细中文注释，解释每段逻辑的作用
- 优先用简单易懂的实现，不做过早优化
- 每个项目附带 README.md 说明运行方法
- 变量名/函数名/命令用英文，注释用中文

## 核心规则（严格遵守）
- **思考过程必须用中文写**，所有内部推理、分析、规划都要用中文。英文只出现在代码标识符和用户指定的术语中。

## 沟通规则
- 默认中文交流
- 结论先行，再给理由，不要铺垫背景
- 不要夸我的想法好、不说「很好的问题」、不开头加「当然可以」
- 方案有问题直接指出，有更好的做法直接说

## 约束
- 新项目先更新 CLAUDE.md 定规则，新目录先定结构约定
- 改需求先改文档，再改代码

## 红线（必须经我确认）
1. 删除文件、目录或 git 历史
2. 修改 .env、密钥、token、CI/CD 配置
3. 数据库 schema 变更或数据迁移
4. git push、git rebase、git reset --hard、强制推送
5. 安装新的全局依赖或修改系统配置
6. 公开发布（npm publish、部署到生产等）

## 工程纪律
- 改完主动跑验证
- 不为了能跑而注释报错或加绕过标记，找根本原因
- 密钥、token、密码不进代码、不进 commit、不进日志
- 大改动前先在 Plan Mode 出方案，确认后再动手
