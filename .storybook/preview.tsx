import type {Preview} from '@storybook/react-vite'
import {ThemeProvider} from '../packages/ui/src/components/ThemeProvider/ThemeProvider'

import '@duro-app/ui/strict.css'
import '@duro-app/ui/reset.css'

const bgToTheme: Record<string, 'dark' | 'light' | 'high-contrast'> = {
  dark: 'dark',
  light: 'light',
  'high-contrast': 'high-contrast',
}

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        dark: {name: 'Dark', value: '#0f0f0f'},
        light: {name: 'Light', value: '#ffffff'},
        'high-contrast': {name: 'High Contrast', value: '#000000'},
      },
    },
    a11y: {
      options: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag2aaa', 'best-practice'],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  initialGlobals: {
    backgrounds: {
      value: 'dark',
    },
  },

  decorators: [
    (Story, context) => {
      const bgKey = context.globals?.backgrounds?.value || 'dark'
      const theme = bgToTheme[bgKey] || 'dark'
      return (
        <ThemeProvider theme={theme}>
          <Story />
        </ThemeProvider>
      )
    },
  ],
}

export default preview
