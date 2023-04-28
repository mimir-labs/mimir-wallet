#!/usr/bin/env bash

set -e

# cleanup js
echo "*** Cleaning js builds"
yarn mimir-dev-clean-build
