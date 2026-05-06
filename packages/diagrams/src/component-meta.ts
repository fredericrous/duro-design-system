export interface ComponentMeta {
  description: string
  whenToUse: string[]
  whenNotToUse: string[]
  anatomy?: {required: string[]; optional?: string[]}
  relatedTo?: Array<{component: string; relationship: string}>
  example: string
}
