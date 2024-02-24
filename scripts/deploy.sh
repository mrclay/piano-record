#!/bin/bash

set -euo pipefail

# SRC and DEST must have trailing slashes
SRC=dist/
DEST=/home/mrclayor/public_html/piano/

npm run build

rsync -avzh ${SRC} mrclay:${DEST}