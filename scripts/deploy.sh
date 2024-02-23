#!/bin/bash

set -euo pipefail

npm run build

# https://lftp.yar.ru/lftp-man.html
# https://www.gnu.org/software/inetutils/manual/html_node/The-_002enetrc-file.html
lftp galileo.iwebfusion.net <<-EOF
  # Get the top level files
  mirror --no-recursion -v -e -P=5 -R dist /public_html/piano

  # Main assets
  rm -r /public_html/piano/assets
  mirror -v -e -P=5 -R dist/assets /public_html/piano/assets

  # These are big files. Don't worry about time differences
  mirror --ignore-time -v -e -P=5 -R dist/media /public_html/piano/media

  bye
EOF
