import {Schema} from 'effect'
import {css, html} from 'react-strict-dom'
import {PageShell} from '../../../packages/ui/src/components/PageShell'
import {Tabs} from '../../../packages/ui/src/components/Tabs/Tabs'
import {Form} from '../../../packages/ui/src/components/Form/Form'
import {Field} from '../../../packages/ui/src/components/Field/Field'
import {Input} from '../../../packages/ui/src/components/Input/Input'
import {Fieldset} from '../../../packages/ui/src/components/Fieldset/Fieldset'
import {Button} from '../../../packages/ui/src/components/Button/Button'
import {Stack} from '../../../packages/ui/src/components/Stack/Stack'
import {Inline} from '../../../packages/ui/src/components/Inline/Inline'
import {Heading} from '../../../packages/ui/src/components/Heading/Heading'
import {Text} from '../../../packages/ui/src/components/Text/Text'
import {Card} from '../../../packages/ui/src/components/Card/Card'
import {Switch} from '../../../packages/ui/src/components/Switch/Switch'
import type {ComponentMeta} from '../types'

const ProfileSchema = Schema.Struct({
  displayName: Schema.String.pipe(
    Schema.minLength(1, {message: () => 'Display name is required'}),
  ),
  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {message: () => 'Enter a valid email'}),
  ),
})

export function SettingsPageRecipe() {
  return (
    <PageShell maxWidth="md" padding="md" header={<Heading level={1}>Settings</Heading>}>
      <Tabs.Root defaultValue="profile">
        <Tabs.List>
          <Tabs.Tab value="profile">Profile</Tabs.Tab>
          <Tabs.Tab value="notifications">Notifications</Tabs.Tab>
          <Tabs.Tab value="security">Security</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profile">
          <Stack gap="lg">
            <Card>
              <Stack gap="lg">
                <Heading level={3}>Profile Information</Heading>
                <Form
                  schema={ProfileSchema}
                  defaultValues={{displayName: '', email: ''}}
                  onSubmit={(data) => console.log('save profile', data)}
                >
                  {({formState}) => (
                    <Fieldset.Root gap="md">
                      <Field.Root name="displayName">
                        <Field.Label>Display name</Field.Label>
                        <Input placeholder="Your name" />
                        <Field.Error />
                      </Field.Root>

                      <Field.Root name="email">
                        <Field.Label>Email</Field.Label>
                        <Input type="email" placeholder="you@example.com" />
                        <Field.Error />
                      </Field.Root>

                      <Inline gap="sm" justify="end">
                        <Button variant="secondary">Cancel</Button>
                        <Button type="submit" disabled={!formState.isValid}>
                          Save changes
                        </Button>
                      </Inline>
                    </Fieldset.Root>
                  )}
                </Form>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="notifications">
          <Card>
            <Stack gap="md">
              <Heading level={3}>Notification Preferences</Heading>
              <Switch defaultChecked>Email notifications</Switch>
              <Switch>Push notifications</Switch>
              <Switch defaultChecked>Weekly digest</Switch>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="security">
          <Card>
            <Stack gap="md">
              <Heading level={3}>Security</Heading>
              <Text color="muted">Security settings will appear here.</Text>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs.Root>
    </PageShell>
  )
}

export const recipeMeta: ComponentMeta = {
  description:
    'Full settings page with tabbed navigation, profile form, notification switches, and page shell.',
  whenToUse: ['App settings pages', 'Account/profile management views'],
  whenNotToUse: ['Simple single-form pages — use just Form + Card'],
  example: '<SettingsPageRecipe />',
}
