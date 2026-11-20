---
'@greenharness/greenrack-cli': patch
---

The generated SessionStart hook stages each fetch under a per-process name (`<cache>.tmp.<pid>`), so two sessions starting together no longer overwrite one another; bounds both `npx` calls with a POSIX-sh watchdog (60 seconds, `GREENRACK_HOOK_TIMEOUT` to change it); prints one stderr line naming `sh .claude/hooks/greenrack-catalog.sh` when the fetch fails or times out and there is no cache; and `hook install` replaces the old `.claude/.duro-session.cache*` .gitignore line (and its generated comment) with the new block.
