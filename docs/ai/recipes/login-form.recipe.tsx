import {Schema} from 'effect'
import {css, html} from 'react-strict-dom'
import {Form} from '../../../packages/ui/src/components/Form/Form'
import {Field} from '../../../packages/ui/src/components/Field/Field'
import {Input} from '../../../packages/ui/src/components/Input/Input'
import {Fieldset} from '../../../packages/ui/src/components/Fieldset/Fieldset'
import {Button} from '../../../packages/ui/src/components/Button/Button'
import {Stack} from '../../../packages/ui/src/components/Stack/Stack'
import {Heading} from '../../../packages/ui/src/components/Heading/Heading'
import type {ComponentMeta} from '../types'

const LoginSchema = Schema.Struct({
  username: Schema.String.pipe(
    Schema.minLength(3, {message: () => 'Username must be at least 3 characters'}),
  ),
  password: Schema.String.pipe(
    Schema.minLength(8, {message: () => 'Password must be at least 8 characters'}),
  ),
})

const styles = css.create({
  wrap: {maxWidth: 400},
})

export function LoginFormRecipe() {
  return (
    <html.div style={styles.wrap}>
      <Stack gap="lg">
        <Heading level={2}>Log in</Heading>
        <Form
          schema={LoginSchema}
          defaultValues={{username: '', password: ''}}
          onSubmit={(data) => console.log('login', data)}
        >
          {({formState}) => (
            <Fieldset.Root gap="md">
              <Field.Root name="username">
                <Field.Label>Username</Field.Label>
                <Input placeholder="Enter username" />
                <Field.Error />
              </Field.Root>

              <Field.Root name="password">
                <Field.Label>Password</Field.Label>
                <Input type="password" placeholder="Enter password" />
                <Field.Error />
              </Field.Root>

              <Button type="submit" disabled={!formState.isValid}>
                Log in
              </Button>
            </Fieldset.Root>
          )}
        </Form>
      </Stack>
    </html.div>
  )
}

export const recipeMeta: ComponentMeta = {
  description: 'Login form with username/password fields and Effect Schema validation.',
  whenToUse: ['Authentication pages', 'Login dialogs'],
  whenNotToUse: ['Registration forms with many fields — extend this pattern'],
  example: '<LoginFormRecipe />',
}
