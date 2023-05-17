const VOID_ELEMENTS = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'menuitem',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

const NO_WHITESPACE = ['table', 'tbody', 'tfoot', 'thead', 'tr'];

export default VOID_ELEMENTS;

export const canHaveChildren = (tagName: string): boolean =>
  VOID_ELEMENTS.indexOf(tagName.toLowerCase()) === -1;

export const canHaveWhitespace = (tagName: string): boolean =>
  NO_WHITESPACE.indexOf(tagName.toLowerCase()) !== -1;
