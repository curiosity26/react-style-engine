import constructStyleFromDefinition from './constructStyleFromDefinition'
import tryCatch from '../utils/tryCatch';
import { StyleDefinition, StyleRules, Scales, ConstructableStyleSheet } from '../types';

type StyleSheetDefinition = {
  directives?: string[]; // Directives start with @
  hostRules?: StyleRules;
  childRules?: StyleRules;
  rules?: StyleRules;
  media?: MediaList | string;
  selector?: string;
}

const reduceStyles = (scales: Scales) =>
  (def: StyleSheetDefinition, [ key, value ]: [string, StyleDefinition | string]): StyleSheetDefinition => {
    if (!value) return def

    // Extract Directives
    if ('@' === key[0]) {
      const { directives = [] } = def

      if ('string' === typeof value) {
        directives.push(`${key} ${value}`)
      } else {
        const directiveRule = Object.entries(value)
          .reduce((directive: string, [ directiveName, definition ]: [string, StyleDefinition]): string =>
            `${directive} ${directiveName} {${constructStyleFromDefinition(definition)}}\n`, '')


        directives.push(`${key} {\n${directiveRule}\n}`)
      }

      return { ...def, directives }
    }


    // Extract :host... styles: i.e. :host(class_on_host), :host:after, :host .child
    if ([ '(', ':', ' ', '&' ].includes(key[0]) || '-context' === key) {
      const { hostRules } = def
      const selector = '&' === key[0] ? key.substring(1) : key

      return { ...def, hostRules: { ...hostRules, [selector]: value } }
    }

    // Extract child styles: <child-element>
    if (60 === key.charCodeAt(0)) {
      const { childRules } = def
      const selector = key.substring(1, key.lastIndexOf(String.fromCharCode(62))).trim()

      return { ...def, childRules: { ...childRules, [selector]: value } }
    }

    // Extract styles for scales
    if (key in scales) {
      const scaleStyleDefinitions = Object.entries(value).reduce(reduceStyles({}), {});
      return { ...def, [key]: scaleStyleDefinitions }
    }

    // Extract regular css rules for use within a selector
    const { rules } = def
    return { ...def, rules: { ...rules, [key]: value } };
  }

const stringifyStyle = selector => ([ innerSelector, rules ]: [ string, StyleDefinition ]): string =>
  `${selector}${innerSelector} {
    ${constructStyleFromDefinition(rules)}
  }`

const reduceHostStyles = selector => (body: string[], [ key, rule ]: [ string, StyleDefinition ]): string[] => {
  if (!rule) return body

  body.push(stringifyStyle(selector)([ key, rule ]))

  return body
}

const reduceChildStyles = (ruleBodies: string[], [ selector, rules ]: [string, StyleDefinition]): string[] => {
  if (!selector || !rules || 'string' === typeof rules || Array.isArray(rules)) return ruleBodies;

  ruleBodies.push(`${selector} {
        ${constructStyleFromDefinition(rules)}
      }`)

  return ruleBodies;
}

const buildStyleSheet = ({ rules, hostRules, childRules, media, selector, directives }: StyleSheetDefinition) => {
  const styleSheet = new CSSStyleSheet() as unknown as ConstructableStyleSheet
  if (media) {
    styleSheet.media = media
  }

  const selectorBody = rules && constructStyleFromDefinition(rules)
  const wrappedSelectorBody = Object.entries(hostRules).reduce(reduceHostStyles(selector), [])
  const childSelectorBody = Object.entries(childRules).reduce(reduceChildStyles, [])


  if (!selectorBody && !wrappedSelectorBody.length && !childSelectorBody.length && !directives.length) return

  const insertRule = rule => tryCatch(() => rule && styleSheet.insertRule(rule))

  directives.forEach(insertRule)

  if (selector && selectorBody) {
    insertRule(`${selector} {
      ${selectorBody}
    }`)
  }

  wrappedSelectorBody.forEach(insertRule)
  childSelectorBody.forEach(insertRule)

  return styleSheet
}

export default (definition?: Record<string, StyleRules | StyleDefinition | string> | StyleDefinition | undefined, scales: Scales = {}, selector = ':host'): ConstructableStyleSheet[] => {
  if (!definition) return [];

  const { directives, hostRules, childRules, rules, ...scaleRules } = Object.entries(definition)
    .reduce(reduceStyles(scales), {
      directives: [],
      hostRules: {},
      childRules: {},
      rules: {},
    })
  const computedStyleSheets = [ buildStyleSheet({ selector, rules, hostRules, childRules, directives }) ]
  const scaleStyleSheets = Object.entries(scaleRules)
    .reduce((styleSheets: ConstructableStyleSheet[], [ scale, { rules = {}, hostRules = {}, childRules = {}, directives = [] } ]: [string, StyleSheetDefinition]) => {
      if (!Object.keys(rules).length && !Object.keys(hostRules).length && !Object.keys(childRules).length && !directives.length) {
        return styleSheets
      }

      const media = scales[scale];

      return [
        ...styleSheets,
        buildStyleSheet({ selector, rules, hostRules, childRules, directives, media }),
      ]
    }, [])

  return [ ...computedStyleSheets, ...scaleStyleSheets ].filter(sheet => sheet)
}