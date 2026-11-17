/**
 * The names the old Duro CLI wrote into a repository. `greenrack hook install`
 * reads them to recognise its predecessor's wiring and migrate it; nothing
 * else spells them.
 */
export const LEGACY_HOOK_SCRIPT_PATH = '.claude/hooks/duro-catalog.sh'
export const LEGACY_PLAN_HOOK_SCRIPT_PATH = '.claude/hooks/duro-plan.sh'
export const LEGACY_HOOK_NOTES_PATH = '.claude/duro-hook.local.md'
export const LEGACY_HOOK_CACHE_PATH = '.claude/.duro-session.cache'
