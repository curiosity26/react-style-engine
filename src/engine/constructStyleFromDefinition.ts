import hyphenateStyleName from './hyphenateStyleName'
import { StyleDefinition, StyleRules } from '../types';

const convertStyle = (field: string, value: StyleDefinition | StyleRules): string => {
  if ('function' === typeof value) return convertStyle(field, value())
  if (Array.isArray(value)) return `${ hyphenateStyleName(field) }: ${ value.join(' ') };\n`

  if ('object' === typeof value) {
    return Object.entries(value)
      .reduce((style, [ key, rule ]) => {
        if (!rule) return style

        return `${style}${ field }-${ hyphenateStyleName(key) }: ${ rule };\n`
      }, '')
  }

  return `${ hyphenateStyleName(field) }: ${ value };\n`
}

export default (definition: StyleRules | StyleDefinition): string =>
  Object.entries(definition)
        .reduce((style, [ field, value ]) => value ? style + convertStyle(field, value) : style, '')