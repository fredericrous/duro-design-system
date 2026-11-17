#!/bin/sh
# Every "duro" outside history must sit in a file scripts/rename-allowlist.txt
# names (greenrack rename, ADR-0075). Prints each stray file and exits 1;
# exits 2 when git grep itself fails (not a repository, a bad pathspec).
set -eu
cd "$(dirname "$0")/.."
allow=$(grep -v '^#' scripts/rename-allowlist.txt | grep -v '^$' | cut -f1)

# allowed FILE: true when an allowlist entry names FILE, or a directory holding it.
allowed() {
  for a in $allow; do
    case "$a" in
      */)
        case "$1" in
          "$a"*) return 0 ;;
        esac
        ;;
      *)
        if [ "$1" = "$a" ]; then return 0; fi
        ;;
    esac
  done
  return 1
}

# git grep exits 1 when nothing matches, which is a pass; anything else is an error.
files=$(git grep -l -i duro -- ':!docs/plans' ':!docs/adr' ':!.adr' ':!.changeset' \
  ':!packages/cli/registry.json' ':!scripts/rename-allowlist.txt' \
  ':!scripts/check-rename-allowlist.sh') || [ $? -eq 1 ] || exit 2

stray=0
tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT
printf '%s\n' "$files" > "$tmp"
while IFS= read -r f; do
  [ -n "$f" ] || continue
  if ! allowed "$f"; then
    printf 'not in the allowlist: %s\n' "$f"
    stray=1
  fi
done < "$tmp"
exit "$stray"
