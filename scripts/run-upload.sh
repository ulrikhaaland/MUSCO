#!/bin/bash

# Get the absolute path of the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Navigate to the project root (one level up from scripts)
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

echo "Working from directory: $ROOT_DIR"

# Create a logs directory if it doesn't exist
mkdir -p logs

# Get the current date and time for the log file name
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
LOG_FILE="logs/upload-${TIMESTAMP}.log"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "Error: .env.local file not found in the root directory!"
  echo "This file should contain your Firebase Admin SDK credentials"
  exit 1
fi

# Check if a specific file was specified
if [ "$1" != "" ]; then
  # Check if the path is relative or absolute
  if [[ "$1" == /* ]]; then
    # Absolute path
    FILE_PATH="$1"
  else
    # Relative path from where the script was called
    FILE_PATH="$ROOT_DIR/$1"
  fi
  echo "Uploading file: $FILE_PATH"
  echo "Saving output to ${LOG_FILE}"
  npx ts-node "$SCRIPT_DIR/upload-to-firestore.ts" "$FILE_PATH" | tee "${LOG_FILE}"
else
  echo "Uploading all exercise files"
  echo "Saving output to ${LOG_FILE}"
  npx ts-node "$SCRIPT_DIR/upload-to-firestore.ts" | tee "${LOG_FILE}"
fi

# Check if the upload was successful
if [ $? -eq 0 ]; then
  echo "Upload completed successfully!"
else
  echo "Upload failed. Check the log file for details: ${LOG_FILE}"
  exit 1
fi

echo "Full log available at: ${ROOT_DIR}/${LOG_FILE}" 