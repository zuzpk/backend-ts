#!/bin/bash

# Define the port
PORT=3001

fuser -k $PORT/tcp

# Start the Express server
echo "Starting Express server on port $PORT"
pnpm start  # Or `npm run dev` if using npm