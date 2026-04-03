#!/bin/bash

set -euo pipefail

SERVER_PID=""

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID"
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT

npm run tsc
npm run test

VITE_LOCAL=1 vite build

npx serve -c serve.json &
SERVER_PID=$!

sleep 1
open http://localhost:3000
wait "$SERVER_PID"
