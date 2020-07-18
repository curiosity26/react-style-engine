import hyphenateStyleName from './hyphenateStyleName'
import { StyleDefinition, StyleRules } from '../types';

const reduceStyleObject = field => (style, [ key, rule ]) => {
  if (!rule) return style

  return `${style}${ field }-${ hyphenateStyleName(key) }: ${ rule };\n`
}

const convertStyle = (field: string, value: StyleDefinition | StyleRules): string => {
  if ('function' === typeof value) return convertStyle(field, value())
  if (Array.isArray(value)) return `${ hyphenateStyleName(field) }: ${ value.join(' ') };\n`

  if ('object' === typeof value) {
    return Object.entries(value)
      .reduce(reduceStyleObject(field), '')
  }

  return `${ hyphenateStyleName(field) }: ${ value };\n`
}

const reduceStyleDefinition = (style: string, [ field, value ]: [ string, StyleDefinition ]): string =>
  value ? style + convertStyle(field, value) : style

export default (definition: StyleRules | StyleDefinition): string =>
  Object.entries(definition).reduce(reduceStyleDefinition, '')