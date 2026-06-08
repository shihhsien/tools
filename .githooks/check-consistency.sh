#!/usr/bin/env bash
# Consistency guard for nyc-restaurant-grade.
# Checks three invariants:
#   1. HTML footer version == CLAUDE.md "Current:"
#   2. Test-case count matches across CLAUDE.md, test skill description, and "Run the full" line
#   3. Assertion count matches across the same three places
# Exits 1 if any invariant is violated; 0 otherwise.

set -euo pipefail
cd "$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"

ERR=0
warn() { echo "⚠  CONSISTENCY: $*" >&2; ERR=1; }

# ── 1. Version ────────────────────────────────────────────────────────────────
HTML_VER=$(grep -o 'v[0-9]\+\.[0-9]\+\.[0-9]\+' nyc-restaurant-grade.html | tail -1)
MD_VER=$(grep '^Current:' CLAUDE.md | grep -o 'v[0-9]\+\.[0-9]\+\.[0-9]\+' | head -1)

[ "$HTML_VER" = "$MD_VER" ] \
  || warn "version mismatch — HTML footer says $HTML_VER, CLAUDE.md Current: says $MD_VER"

# ── 2. Test-case count ────────────────────────────────────────────────────────
MD_CASES=$(grep 'Required test cases' CLAUDE.md \
           | grep -o '([0-9]\+ cases' | grep -o '[0-9]\+')

SKILL_CASES_DESC=$(grep '^description:' .claude/skills/test/SKILL.md \
                   | grep -o '[0-9]\+ required cases' | grep -o '^[0-9]\+')

SKILL_CASES_FULL=$(grep 'Run the full' .claude/skills/test/SKILL.md \
                   | grep -o '[0-9]\+-case' | grep -o '[0-9]\+')

[ "$MD_CASES" = "$SKILL_CASES_DESC" ] \
  || warn "test-case count mismatch — CLAUDE.md says $MD_CASES, skill description says $SKILL_CASES_DESC"

[ "$MD_CASES" = "$SKILL_CASES_FULL" ] \
  || warn "test-case count mismatch — CLAUDE.md says $MD_CASES, skill 'Run the full' line says $SKILL_CASES_FULL"

# ── 3. Assertion count ────────────────────────────────────────────────────────
MD_ASSERTS=$(grep 'Required test cases' CLAUDE.md \
             | grep -o '[0-9]\+ assertions' | grep -o '^[0-9]\+')

SKILL_ASSERTS=$(grep 'passed, 0 failed' .claude/skills/test/SKILL.md \
                | grep -o '[0-9]\+ passed' | grep -o '^[0-9]\+')

[ "$MD_ASSERTS" = "$SKILL_ASSERTS" ] \
  || warn "assertion count mismatch — CLAUDE.md says $MD_ASSERTS, skill expected-output line says $SKILL_ASSERTS"

# ── Result ────────────────────────────────────────────────────────────────────
if [ "$ERR" -eq 0 ]; then
  echo "✓ consistency check passed (version=$HTML_VER, cases=$MD_CASES, assertions=$MD_ASSERTS)"
fi
exit "$ERR"
