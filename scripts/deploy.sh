#!/bin/bash

set -euo pipefail

# SRC and DEST must have trailing slashes
SRC=dist/
DEST=/home1/mrclayor/public_html/piano/

if [[ ${MC_USERNAME} == "" ]]; then
  echo 'MC_USERNAME must be defined:'
  echo '  $ export MC_USERNAME=...'
  exit 1
fi

npm run build

rsync -avzh ${SRC} ${MC_USERNAME}@mrclay.org:${DEST}
