#!/bin/sh
# Every "duro" outside history must sit in a file scripts/rename-allowlist.txt
# names (greenrack rename, ADR-0075). Prints each stray file and exits 1.
set -eu
cd "$(dirname "$0")/.."
allow=$(grep -v '^#' scripts/rename-allowlist.txt | grep -v '^$' | cut -f1)
stray=0
for f in $(git grep -l -i duro -- ':!docs/plans' ':!docs/adr' ':!.adr' ':!.changeset' \
  ':!packages/cli/registry.json' ':!scripts/rename-allowlist.txt' ':!scripts/check-rename-allowlist.sh'); do
  ok=0
  for a in $allow; do
    case "$f" in
      "$a" | "$a"*) case "$a" in */) ok=1 ;; *) [ "$f" = "$a" ] && ok=1 ;; esac ;;
    esac
  done
  if [ "$ok" -eq 0 ]; then
    echo "not in the allowlist: $f"
    stray=1
  fi
done
exit "$stray"
