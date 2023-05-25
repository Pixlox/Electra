@echo off

set "SCRIPT_DIR=%~dp0"

echo _______   ___       _______   ________ _________  ________  ________
echo ^|^\  ___ \ ^|^\  \     ^|^\  ___ \ ^|^\   ____^\___   ___^\^\   __  ^|^\   __  \
echo \ \   __/^|\ \  \    \ \   __/^|\ \  \___^\|___ \  \_\ \  ^\  \ \  ^\  \
echo ^\ \  ^\_|/^\ \  \    \ \  ^\_|/^\ \  \       \ \  \ \ \   _  _\ \   __  \
echo  ^\ \  ^\_|\ ^\ \  \____\ \  ^\_|\ ^\ \  \____   \ \  \ \ \  \^  \^  \ \  \
echo   ^\ \_______^\ \_______^\ \_______^\ \_______\  \ \__\ \ \__\\ _\\ \__\ \__\
echo    ^\|_______^\|_______^\|_______^\|_______|   ^\|__|  ^\|__|^\|__|^\|__|
echo.

:MENU
echo Welcome to Electra. Please choose an option below:
echo 1) Start bot
echo 2) Deploy commands
echo 3) Help
set /p choice=

if "%choice%"=="1" (
    echo Starting Lavalink...
    cd /d "%SCRIPT_DIR%\lavalink"

    if not exist "Lavalink.jar" (
        echo Error: Lavalink.jar not found.
        exit /b 1
    )

    start javaw -Xmx1024M -Xms1024M -jar Lavalink.jar
    timeout /t 15 >nul

    echo Starting Electra...
    cd /d "%SCRIPT_DIR%"

    if not exist "index.js" (
        echo Error: index.js not found.
        exit /b 1
    )

    start node index.js

    echo Electra started.

    :BOT_COMMANDS
    set /p command=Enter a command ('quit' to stop the bot):
    if "%command%"=="quit" (
        echo Stopping the bot...

        tasklist /fi "imagename eq node.exe" | find /i "node.exe" >nul
        if %errorlevel% equ 0 (
            echo Killing all Node.js processes...
            taskkill /f /im node.exe
            echo All Node.js processes killed.
        ) else (
            echo No Node.js processes found.
        )

        goto :END
    ) else (
        echo Invalid command. Try again.
        goto :BOT_COMMANDS
    )
) else if "%choice%"=="2" (
    echo Deploying commands...
    cd /d "%SCRIPT_DIR%"

    if not exist "deploy.js" (
        echo Error: deploy.js not found.
        exit /b 1
    )

    start node deploy.js

    echo Commands deployed successfully.
    set /p start_choice=Would you like to start the bot? (Y/N)

    if /i "%start_choice%"=="Y" (
        goto :BOT_COMMANDS
    ) else (
        goto :END
    )
) else if "%choice%"=="3" (
    echo.
    echo Electra is a multi-purpose utility discord bot. Some of Electra's functions require external dependencies, some of which must be installed by the user.
    echo Lavalink is required for Electra's music commands to function, and Lavalink depends on Java. Lavalink is included with Electra. However, Java must be installed separately.
    echo Electra and Lavalink play best with Java v13. For more information, head to the Setup section on Electra's GitHub page.
    echo.
    echo Electra's GitHub repository is found at: https://github.com/Pixlox/Electra
    echo.
) else (
    echo That is an invalid choice.
)

goto :MENU

:END
tasklist /fi "imagename eq java.exe" | find /i "java.exe" >nul
if %errorlevel% equ 0 (
    echo Killing all Java processes...
    taskkill /f /im java.exe
    echo All Java processes killed.
) else (
    echo No Java processes found.
)

