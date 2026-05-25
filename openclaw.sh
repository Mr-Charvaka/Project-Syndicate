#!/bin/bash
export OPENCLAW_HOME="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.claw"
node "$(dirname "${BASH_SOURCE[0]}")/openclaw/openclaw.mjs" "$@"
