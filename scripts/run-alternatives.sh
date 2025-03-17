#!/bin/bash

# Make sure we're in the right directory
cd "$(dirname "$0")/.."

# Get the body part from command line or use "abs" as default
BODY_PART=${1:-abs}

# Create a logs directory if it doesn't exist
mkdir -p logs

# Get the current date and time for the log file name
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
LOG_FILE="logs/alternatives-${BODY_PART}-${TIMESTAMP}.log"

echo "Running alternatives generator for ${BODY_PART}..."
echo "Saving output to ${LOG_FILE}"

# Run the script and capture all output
npx ts-node scripts/generateAlternatives.ts ${BODY_PART} > "${LOG_FILE}" 2>&1

# Check if the command succeeded
if [ $? -eq 0 ]; then
  echo "Generation completed successfully!"
  echo "Last 20 lines of the log:"
  tail -n 20 "${LOG_FILE}"
else
  echo "Generation failed. See the log file for details."
  echo "Last 50 lines of the log:"
  tail -n 50 "${LOG_FILE}"
fi

echo "Full log available at: ${LOG_FILE}" 