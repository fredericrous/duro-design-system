export interface ComponentMeta {
  description: string
  whenToUse: string[]
  whenNotToUse: string[]
  anatomy?: {required: string[]; optional?: string[]}
  /**
   * Neighbouring components and how they relate.
   *
   * `kind` is required because the two relationships are not interchangeable
   * and tooling has to tell them apart: `contrast` means the two are
   * alternatives you pick BETWEEN ("Switch for on/off settings; Checkbox for
   * opt-in"), `composition` means one goes INSIDE the other ("Place Input
   * inside Field.Root"). The session-start catalog surfaces the contrast half
   * as a wrong-pick guard, so an edge filed under the wrong kind quietly
   * either disappears from it or pollutes it.
   */
  relatedTo?: Array<{
    component: string
    kind: 'contrast' | 'composition'
    relationship: string
  }>
  example: string
}
