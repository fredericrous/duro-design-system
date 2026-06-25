import * as React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Section as RESection,
  Heading as REHeading,
  Text as REText,
  Button as REButton,
  Hr as REHr,
  Link as RELink,
  Preview,
} from '@react-email/components'
import {palette, space, radius, font, cls, darkModeCss} from './theme'

const L = palette.light

/**
 * Root wrapper: <Html><Head> (color-scheme meta + the prefers-color-scheme
 * dark <style>) + a themed card <Body>/<Container>. Compose the rest of the
 * email inside it with the other primitives.
 */
export function EmailShell({preview, children}: {preview?: string; children: React.ReactNode}) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style dangerouslySetInnerHTML={{__html: darkModeCss}} />
      </Head>
      {preview ? <Preview>{preview}</Preview> : null}
      <Body
        className={cls.body}
        style={{
          backgroundColor: L.bg,
          fontFamily: font.family,
          margin: 0,
          padding: `${space.xl} 0`,
        }}
      >
        <Container
          className={cls.card}
          style={{
            backgroundColor: L.card,
            border: `1px solid ${L.cardBorder}`,
            borderRadius: radius.md,
            margin: '0 auto',
            maxWidth: '520px',
            padding: space.xl,
          }}
        >
          {children}
        </Container>
      </Body>
    </Html>
  )
}

export function Heading({as = 'h1', children}: {as?: 'h1' | 'h2'; children: React.ReactNode}) {
  const isH1 = as === 'h1'
  return (
    <REHeading
      as={as}
      className={cls.heading}
      style={{
        color: L.heading,
        fontSize: isH1 ? font.sizeHeading : font.sizeMd,
        fontWeight: isH1 ? font.weightBold : font.weightSemibold,
        margin: isH1 ? `0 0 ${space.md}` : `0 0 ${space.sm}`,
      }}
    >
      {children}
    </REHeading>
  )
}

export type TextVariant = 'body' | 'small' | 'footer'

export function Text({
  variant = 'body',
  children,
  style,
}: {
  variant?: TextVariant
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  const muted = variant !== 'body'
  return (
    <REText
      className={muted ? cls.textMuted : cls.text}
      style={{
        color: muted ? L.textMuted : L.text,
        fontSize: variant === 'footer' ? font.sizeXs : font.sizeSm,
        lineHeight: font.lineHeight,
        margin: `0 0 ${space.ms}`,
        ...style,
      }}
    >
      {children}
    </REText>
  )
}

export function Button({
  href,
  children,
  align = 'center',
}: {
  href: string
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
}) {
  return (
    <RESection style={{textAlign: align, margin: `${space.xl} 0`}}>
      <REButton
        href={href}
        className={cls.button}
        style={{
          backgroundColor: L.accent,
          color: L.accentText,
          borderRadius: radius.sm,
          display: 'inline-block',
          fontSize: font.sizeSm,
          fontWeight: font.weightSemibold,
          padding: `${space.ms} ${space.xl}`,
          textDecoration: 'none',
        }}
      >
        {children}
      </REButton>
    </RESection>
  )
}

export function Hr() {
  return <REHr className={cls.hr} style={{borderColor: L.border, margin: `${space.lg} 0`}} />
}

export function Link({
  href,
  children,
  style,
}: {
  href: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <RELink
      href={href}
      className={cls.link}
      style={{color: L.accent, textDecoration: 'underline', ...style}}
    >
      {children}
    </RELink>
  )
}

export function Section({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return <RESection style={{margin: `${space.lg} 0`, ...style}}>{children}</RESection>
}
