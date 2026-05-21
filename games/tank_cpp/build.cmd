@echo off
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x86_amd64
cl.exe /utf-8 /std:c++20 /EHsc /Fe:tank.exe main.cpp /link user32.lib gdi32.lib
echo Exit code: %ERRORLEVEL%
