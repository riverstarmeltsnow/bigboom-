@echo off
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x86_amd64 >nul
cl.exe /std:c++20 /EHsc /Fe:tank.exe /W4 main.cpp /link user32.lib gdi32.lib
if %errorlevel%==0 (
    echo [OK] 编译成功: tank.exe
) else (
    echo [失败] 编译出错
)
