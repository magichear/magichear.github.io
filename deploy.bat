@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1

set "ROOT=%~dp0"
:: 去掉尾部反斜杠
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo === Step 1: 删除根目录下非保护文件 ===

:: 保护列表（文件夹和文件）
:: .git  magichear-home  .gitignore  README.md  deploy.bat

:: 删除非保护的文件
for %%F in ("%ROOT%\*") do (
    set "NAME=%%~nxF"
    if /I not "!NAME!"==".gitignore" (
    if /I not "!NAME!"=="README.md" (
    if /I not "!NAME!"=="deploy.bat" (
        echo 删除文件: %%F
        del /f /q "%%F"
    )))
)

:: 删除非保护的文件夹
for /d %%D in ("%ROOT%\*") do (
    set "NAME=%%~nxD"
    if /I not "!NAME!"==".git" (
    if /I not "!NAME!"=="magichear-home" (
        echo 删除文件夹: %%D
        rd /s /q "%%D"
    ))
)

echo === Step 2: 构建项目 ===
cd /d "%ROOT%\magichear-home"
call npm run build
if errorlevel 1 (
    echo 构建失败！
    exit /b 1
)

echo === Step 3: 复制构建文件到根目录 ===
xcopy /s /e /y /i "%ROOT%\magichear-home\dist\*" "%ROOT%\"

echo === 完成 ===
echo 保护文件检查:
if exist "%ROOT%\.git" (echo   .git        OK) else (echo   .git        MISSING!)
if exist "%ROOT%\magichear-home" (echo   magichear-home OK) else (echo   magichear-home MISSING!)
if exist "%ROOT%\.gitignore" (echo   .gitignore  OK) else (echo   .gitignore  MISSING!)
if exist "%ROOT%\README.md" (echo   README.md   OK) else (echo   README.md   MISSING!)
if exist "%ROOT%\deploy.bat" (echo   deploy.bat  OK) else (echo   deploy.bat  MISSING!)

endlocal
