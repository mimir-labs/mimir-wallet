#!/usr/bin/env bash

set -e

./scripts/clean-js.sh

echo "*** Cleaning zip"
rm -rf mimir-wallet.zip
