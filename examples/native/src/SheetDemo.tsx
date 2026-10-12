import {Button, Drawer, Inline, List, Text} from '@duro-app/ui'

const SESSIONS = Array.from({length: 40}, (_, i) => `Session ${i + 1}`)

/**
 * Checkpoint B scenarios for Drawer: the snap sheet of the picked B0
 * direction (docs/mockups/native-sheet/Done.dc.html) with a list long enough
 * to scroll inside it, a left drawer (AppShell's rail on phones), and a
 * content-height bottom drawer.
 */
export function SheetDemo() {
  return (
    <Inline gap="sm">
      <Drawer.Root anchor="bottom" snapPoints={['medium', 'large']}>
        <Drawer.Trigger>
          <Button>Open a sheet</Button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Header titleAlign="center">
            <Drawer.Title>Move to project</Drawer.Title>
            <Drawer.Close>
              <Button variant="link">Done</Button>
            </Drawer.Close>
          </Drawer.Header>
          <Drawer.Body>
            <List.Root aria-label="Sessions">
              {SESSIONS.map((s) => (
                <List.Item key={s}>
                  <List.Text>{s}</List.Text>
                </List.Item>
              ))}
            </List.Root>
          </Drawer.Body>
        </Drawer.Portal>
      </Drawer.Root>
      <Drawer.Root anchor="left">
        <Drawer.Trigger>
          <Button variant="secondary">Left drawer</Button>
        </Drawer.Trigger>
        <Drawer.Portal size="sm">
          <Drawer.Header>
            <Drawer.Title>Navigation</Drawer.Title>
            <Drawer.Close />
          </Drawer.Header>
          <Drawer.Description>Swipe left or press the backdrop to close.</Drawer.Description>
          <Drawer.Body>
            <Text>Rail content</Text>
          </Drawer.Body>
        </Drawer.Portal>
      </Drawer.Root>
      <Drawer.Root anchor="bottom">
        <Drawer.Trigger>
          <Button variant="secondary">Content sheet</Button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Header>
            <Drawer.Title>Share</Drawer.Title>
            <Drawer.Close />
          </Drawer.Header>
          <Drawer.Body>
            <Text>As tall as its content.</Text>
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.Close>
              <Button>Copy link</Button>
            </Drawer.Close>
          </Drawer.Footer>
        </Drawer.Portal>
      </Drawer.Root>
    </Inline>
  )
}
