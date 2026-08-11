import {RuleTester} from '@typescript-eslint/rule-tester'
import {afterAll, describe, it} from 'vitest'

// RuleTester emits its cases through whatever describe/it it can find. Vitest
// doesn't install globals unless `globals: true` (this repo doesn't), so they
// are wired explicitly — otherwise every rule file would run its assertions
// outside any test and vitest would report "no tests found". `afterAll` is
// required by @typescript-eslint/rule-tester specifically. RuleTester.itOnly
// is deliberately not wired: focused tests are banned in this repo.
RuleTester.afterAll = afterAll
RuleTester.describe = describe
RuleTester.it = it
