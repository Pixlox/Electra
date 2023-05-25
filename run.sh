#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cat << "EOF"
 _______   ___       _______   ________ _________  ________  ________
|\  ___ \ |\  \     |\  ___ \ |\   ____|\___   ___|\   __  \|\   __  \
\ \   __/|\ \  \    \ \   __/|\ \  \___\|___ \  \_\ \  \|\  \ \  \|\  \
 \ \  \_|/_\ \  \    \ \  \_|/_\ \  \       \ \  \ \ \   _  _\ \   __  \
  \ \  \_|\ \ \  \____\ \  \_|\ \ \  \____   \ \  \ \ \  \\  \\ \  \ \  \
   \ \_______\ \_______\ \_______\ \_______\  \ \__\ \ \__\\ _\\ \__\ \__\
    \|_______|\|_______|\|_______|\|_______|   \|__|  \|__|\|__|\|__|\|__|
EOF

while true; do
  echo "\n\nWelcome to Electra. Please choose an option below:"
  echo "1) Start bot"
  echo "2) Deploy commands"
  echo "3) Lavalink cleanup"
  echo "4) Help"
  read -r choice

  if [ "$choice" = "1" ]; then
    echo "Starting Lavalink..."
    cd "$SCRIPT_DIR/lavalink"

    if [ ! -f "Lavalink.jar" ]; then
      echo "Error: Lavalink.jar not found."
      exit 1
    fi

    java -Xmx1024M -Xms1024M -jar Lavalink.jar &
    sleep 15s

    echo "Starting Electra..."
    cd "$SCRIPT_DIR"

    if [ ! -f "index.js" ]; then
      echo "Error: index.js not found."
      exit 1
    fi

    node index.js &

    echo "Electra started."

    while true; do
      read -p "Enter a command ('quit' to stop the bot): " command
      if [ "$command" = "quit" ]; then
        echo "Stopping the bot..."

        node_processes=$(pgrep -f "node index.js")
        if [ -n "$node_processes" ]; then
          echo "Killing Node.js process..."
          kill "$node_processes"
          echo "Node.js process killed."
        else
          echo "No Node.js process found."
        fi

        break
      else
        echo "Invalid command. Try again."
      fi
    done

    echo "Stopping Electra..."
    killall node

  elif [ "$choice" = "2" ]; then
    echo "Deploying commands..."
    cd "$SCRIPT_DIR"

    if [ ! -f "deploy.js" ]; then
      echo "Error: deploy.js not found."
      exit 1
    fi

    node deploy.js

    echo "Commands deployed successfully."
    echo "Would you like to start the bot? (Y/N)"
    read -r start_choice

    if [ "$start_choice" = "Y" ] || [ "$start_choice" = "y" ]; then
      continue
    else
      break
    fi

  elif [ "$choice" = "3" ]; then
    echo "Performing Lavalink cleanup..."
    java_processes=$(pgrep -f "java -Xmx1024M -Xms1024M -jar Lavalink.jar")
    if [ -n "$java_processes" ]; then
      echo "Killing all Java processes..."
      kill "$java_processes"
      echo "All Java processes killed."
    else
      echo "No Java processes found."
    fi

  elif [ "$choice" = "4" ]; then
    echo -e "\nElectra is a multi-purpose utility discord bot. Some of Electra's functions require external dependencies, some of which must be installed by the user."
    echo "Lavalink is required for Electra's music commands to function, and Lavalink depends on Java. Lavalink and Java are NOT included with Electra and must be installed separately."
    echo "Electra and Lavalink work best with Java v13. For more information, head to the Setup section on Electra's GitHub page."
    echo -e "\nElectra's GitHub repository is found at: https://github.com/Pixlox/Electra\n"

  else
    echo "That is an invalid choice."

  fi
done
