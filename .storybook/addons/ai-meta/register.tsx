import React, {useState, useEffect} from 'react'
import {HighlightedCode} from './highlightJsx'
import {addons, types} from 'storybook/manager-api'
import {AddonPanel} from 'storybook/internal/components'

const ADDON_ID = 'duro/ai-meta'
const PANEL_ID = `${ADDON_ID}/panel`
const CHANNEL_EVENT = 'duro/ai-meta/update'

interface ComponentMeta {
  description: string
  whenToUse: string[]
  whenNotToUse: string[]
  anatomy?: {required: string[]; optional?: string[]}
  relatedTo?: Array<{component: string; relationship: string}>
  example: string
}

function AiMetaPanel() {
  const [meta, setMeta] = useState<ComponentMeta | null>(null)

  useEffect(() => {
    const channel = addons.getChannel()
    const handler = (data: ComponentMeta | null) => setMeta(data)
    channel.on(CHANNEL_EVENT, handler)
    return () => channel.off(CHANNEL_EVENT, handler)
  }, [])

  if (!meta) {
    return (
      <div style={{padding: 16, color: '#999', fontFamily: 'sans-serif', fontSize: 14}}>
        <p>No AI meta file found for this component.</p>
        <p style={{marginTop: 8, fontSize: 12, color: '#666'}}>
          Add a <code>.meta.ts</code> file exporting a <code>ComponentMeta</code> object.
        </p>
      </div>
    )
  }

  return (
    <div style={{padding: 16, fontFamily: 'sans-serif', fontSize: 14, color: '#e0e0e0', lineHeight: 1.6, overflowY: 'auto'}}>
      <Section title="Description">
        <p style={{margin: 0}}>{meta.description}</p>
      </Section>

      <Section title="When to use">
        <ul style={{margin: 0, paddingLeft: 20}}>
          {meta.whenToUse.map((item, i) => (
            <li key={i} style={{marginBottom: 4}}>
              <span style={{color: '#4ade80', marginRight: 6}}>✓</span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="When NOT to use">
        <ul style={{margin: 0, paddingLeft: 20}}>
          {meta.whenNotToUse.map((item, i) => (
            <li key={i} style={{marginBottom: 4}}>
              <span style={{color: '#f87171', marginRight: 6}}>✗</span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {meta.anatomy && (
        <Section title="Anatomy">
          <div style={{display: 'flex', gap: 24, flexWrap: 'wrap'}}>
            <div>
              <Label>Required</Label>
              <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
                {meta.anatomy.required.map((part) => (
                  <Tag key={part} variant="required">{part}</Tag>
                ))}
              </div>
            </div>
            {meta.anatomy.optional && meta.anatomy.optional.length > 0 && (
              <div>
                <Label>Optional</Label>
                <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
                  {meta.anatomy.optional.map((part) => (
                    <Tag key={part} variant="optional">{part}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {meta.relatedTo && meta.relatedTo.length > 0 && (
        <Section title="Related components">
          {meta.relatedTo.map((rel, i) => (
            <div key={i} style={{marginBottom: 8}}>
              <strong style={{color: '#60a5fa'}}>{rel.component}</strong>
              <span style={{color: '#999', marginLeft: 8}}>{rel.relationship}</span>
            </div>
          ))}
        </Section>
      )}

      {meta.example && (
        <Section title="Canonical example">
          <pre style={{
            margin: 0, padding: 12, backgroundColor: '#1e1e1e', borderRadius: 8,
            fontSize: 12, lineHeight: 1.5, overflowX: 'auto', color: '#e0e0e0', border: '1px solid #333',
          }}>
            <code><HighlightedCode code={meta.example} /></code>
          </pre>
        </Section>
      )}
    </div>
  )
}

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <div style={{marginBottom: 20}}>
      <h3 style={{margin: '0 0 8px 0', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888'}}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function Label({children}: {children: React.ReactNode}) {
  return <div style={{fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4, textTransform: 'uppercase'}}>{children}</div>
}

function Tag({children, variant}: {children: React.ReactNode; variant: 'required' | 'optional'}) {
  const bg = variant === 'required' ? '#1e3a5f' : '#2d2d2d'
  const color = variant === 'required' ? '#60a5fa' : '#aaa'
  const border = variant === 'required' ? '#2d5a8a' : '#444'
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 12,
      fontFamily: 'monospace', backgroundColor: bg, color, border: `1px solid ${border}`,
    }}>
      {children}
    </span>
  )
}

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'AI Meta',
    render: ({active}) => (
      <AddonPanel active={active ?? false}>
        <AiMetaPanel />
      </AddonPanel>
    ),
  })
})
