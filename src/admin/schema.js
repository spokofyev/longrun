// Which fields the admin shows for each part of content.json.
// kind: 'text' (one line), 'long' (paragraph), 'list' (list of lines),
// 'items' (list of cards, each with its own fields).

const pair = (title, body) => [
  { key: 'title', label: title },
  { key: 'body', label: body, kind: 'long' },
]

export const SECTION_TYPES = {
  properties: {
    name: 'Properties',
    fields: [
      { key: 'title', label: 'Title' },
      {
        key: 'items',
        label: 'Cards',
        kind: 'items',
        itemName: 'Card',
        fields: [
          { key: 'title', label: 'Title' },
          { key: 'body', label: 'Text', kind: 'long' },
          { key: 'tags', label: 'Tags', kind: 'list', itemName: 'Tag' },
        ],
        blank: { title: '', body: '', tags: [] },
      },
      { key: 'footnote', label: 'Footnote', kind: 'long' },
    ],
  },
  team: {
    name: 'Team',
    fields: [
      { key: 'title', label: 'Title', kind: 'long' },
      { key: 'items', label: 'Points', kind: 'list', itemName: 'Point' },
    ],
  },
  products: {
    name: 'Product cards',
    fields: [
      { key: 'eyebrow', label: 'Label above title' },
      { key: 'title', label: 'Title' },
      { key: 'lead', label: 'Subtitle', kind: 'long' },
      { key: 'difficultyLabel', label: '“Key difficulty” label' },
      {
        key: 'cards',
        label: 'Cards',
        kind: 'items',
        itemName: 'Card',
        fields: [
          { key: 'label', label: 'Label' },
          { key: 'problem', label: 'Headline' },
          { key: 'items', label: 'Examples', kind: 'list', itemName: 'Example' },
          { key: 'difficulty', label: 'Key difficulty', kind: 'long' },
        ],
        blank: { label: '', problem: '', items: [], difficulty: '' },
      },
    ],
  },
  scenario: {
    name: 'Sample scenario',
    fields: [
      { key: 'eyebrow', label: 'Label above title' },
      { key: 'title', label: 'Title' },
      { key: 'lead', label: 'Subtitle', kind: 'long' },
      { key: 'taskLabel', label: 'Task label' },
      { key: 'task', label: 'Task', kind: 'long' },
      { key: 'systems', label: 'Systems', kind: 'list', itemName: 'System' },
      { key: 'eventsLabel', label: 'Events label' },
      { key: 'events', label: 'Events', kind: 'items', itemName: 'Event', fields: pair('Event', 'Detail'), blank: { title: '', body: '' } },
      { key: 'note', label: 'Note', kind: 'long' },
      { key: 'successLabel', label: 'Success label' },
      { key: 'success', label: 'Success checks', kind: 'items', itemName: 'Check', fields: pair('Check', 'Detail'), blank: { title: '', body: '' } },
    ],
  },
  factory: {
    name: 'Environment factory',
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'lead', label: 'Subtitle', kind: 'long' },
      { key: 'steps', label: 'Pipeline steps', kind: 'items', itemName: 'Step', fields: pair('Step', 'Detail'), blank: { title: '', body: '' } },
      { key: 'defineTitle', label: 'Definition title' },
      { key: 'parts', label: 'Definition parts', kind: 'list', itemName: 'Part' },
      { key: 'defineNote', label: 'Definition note', kind: 'long' },
    ],
  },
  pack: {
    name: 'Environment pack',
    fields: [
      { key: 'eyebrow', label: 'Label above title' },
      { key: 'title', label: 'Title' },
      { key: 'lead', label: 'Subtitle', kind: 'long' },
      { key: 'packLabel', label: 'Card label' },
      { key: 'big', label: 'Big number' },
      { key: 'bigLabel', label: 'Big number caption' },
      { key: 'includesLabel', label: 'Includes label' },
      { key: 'includes', label: 'Includes', kind: 'list', itemName: 'Item' },
      { key: 'scaleTitle', label: 'Scale title' },
      { key: 'scale', label: 'Scale tiles', kind: 'items', itemName: 'Tile', fields: pair('Value', 'Caption'), blank: { title: '', body: '' } },
      { key: 'scaleCaveat', label: 'Scale caveat', kind: 'long' },
      { key: 'scaleNote', label: 'Scale note', kind: 'long' },
    ],
  },
}

// Fixed parts of the page, outside the reorderable sections.
export const FIXED = {
  hero: {
    name: 'Hero',
    fields: [
      { key: 'title', label: 'Headline', kind: 'long' },
      { key: 'subtitle', label: 'Subtitle', kind: 'long' },
      { key: 'cta', label: 'Button' },
    ],
  },
  contact: {
    name: 'Request form',
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'subtitle', label: 'Subtitle', kind: 'long' },
      { key: 'email', label: 'Requests go to (email)' },
      { key: 'nameLabel', label: 'Name field label' },
      { key: 'emailLabel', label: 'Email field label' },
      { key: 'companyLabel', label: 'Company field label' },
      { key: 'messageLabel', label: 'Message field label' },
      { key: 'messagePlaceholder', label: 'Message placeholder', kind: 'long' },
      { key: 'button', label: 'Button' },
    ],
  },
  footer: {
    name: 'Footer',
    fields: [
      { key: 'copyright', label: 'Name after ©' },
      { key: 'links', label: 'Links', kind: 'items', itemName: 'Link', fields: [{ key: 'title', label: 'Text' }, { key: 'body', label: 'URL' }], blank: { title: '', body: 'https://' } },
    ],
  },
  site: {
    name: 'Header & SEO',
    fields: [
      { key: 'brand', label: 'Name in header' },
      { key: 'navLink', label: 'Header link' },
      { key: 'title', label: 'Browser tab / search title' },
      { key: 'description', label: 'Search & link-preview description', kind: 'long' },
    ],
  },
}
