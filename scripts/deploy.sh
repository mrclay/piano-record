#!/bin/bash

set -euo pipefail

SRC=dist/
DEST=/home/mrclayor/public_html/piano/

if [[ ${MC_USERNAME} == "" ]]; then
  echo 'MC_USERNAME must be defined:'
  echo '  $ export MC_USERNAME=...'
  exit 1
fi

npm run build

rsync -avzh ${SRC} ${MC_USERNAME}@mrclay.org:${DEST}
