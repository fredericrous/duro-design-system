---
'@greenharness/greenrack-ui': patch
---

`@types/qrcode` is a dependency, no longer a dev dependency: a native consumer whose `tsc` reads the `react-native` sources (`QrCode/geometry.ts` imports `qrcode`) type-checks without adding the types itself.
