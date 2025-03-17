#!/bin/bash

# Script for downloading exercise data from Firestore
# This script will download all exercises or a specific body part's exercises from Firestore

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
# Go to project root (one level up from scripts)
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

# Set up logging
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/download_${TIMESTAMP}.log"

# Check for .env.local file
if [ ! -f .env.local ]; then
  echo "Error: .env.local file not found in project root"
  echo "Please ensure your Firebase credentials are configured"
  exit 1
fi

# Function to run the download script
run_download() {
  local body_part=$1
  local cmd=""
  
  # Configure command based on whether a body part was specified
  if [ -z "$body_part" ]; then
    echo "Downloading exercises for all body parts..."
    cmd="npx ts-node $SCRIPT_DIR/download-from-firestore.ts"
  else
    echo "Downloading exercises for body part: $body_part"
    cmd="npx ts-node $SCRIPT_DIR/download-from-firestore.ts $body_part"
  fi
  
  # Execute the command with logging
  echo "Starting download at $(date)" | tee -a "$LOG_FILE"
  echo "Command: $cmd" >> "$LOG_FILE"
  
  eval "$cmd" 2>&1 | tee -a "$LOG_FILE"
  
  # Check if the command succeeded
  if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "Download completed successfully at $(date)" | tee -a "$LOG_FILE"
    echo "Exercises saved to $SCRIPT_DIR/downloads/"
    return 0
  else
    echo "Download failed at $(date)" | tee -a "$LOG_FILE"
    return 1
  fi
}

# Main script execution
if [ $# -eq 0 ]; then
  # No arguments provided, download all body parts
  run_download
else
  # Download specific body part
  run_download "$1"
fi

# Show final status
if [ $? -eq 0 ]; then
  echo "Download operation completed. See log at: $LOG_FILE"
  echo "Downloaded files are in: $SCRIPT_DIR/downloads/"
else
  echo "Download operation failed. Check log at: $LOG_FILE"
  exit 1
fi 