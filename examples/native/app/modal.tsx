import {PortalHost, Stack, Text} from '@duro-app/ui'
import {DialogDemo} from '../src/DialogDemo'

// A natively presented route: the case where a host at the app root would draw
// behind the route, so Duro's overlays are checked over it (plan N0, Decision 2).
export default function ModalRoute() {
  return (
    <Stack gap="md">
      <Text>Overlays opened here must draw above this route.</Text>
      <DialogDemo label="Open a dialog over the route" />
      {/* Toasts raised while this route is presented draw here, above it. */}
      <PortalHost />
    </Stack>
  )
}
