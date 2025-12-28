#!/bin/bash
TARGET="v9"
for i in {1..60}; do
  VER=$(curl -s https://gmt.otomasikan.com/api/version | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
  echo "Current version: $VER"
  if [ "$VER" == "$TARGET" ]; then
    echo "Version $TARGET detected! Seeding..."
    curl -s "https://gmt.otomasikan.com/api/seed-programs?secret=seed-2024"
    exit 0
  fi
  sleep 10
done
echo "Timeout waiting for v9"
