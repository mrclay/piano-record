#!/bin/bash

set -euo pipefail

npm run build

mv dist piano || echo 0

scp -r piano mrclay:/home/mrclayor/public_html/
