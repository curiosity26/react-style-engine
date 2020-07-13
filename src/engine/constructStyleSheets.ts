import constructStyleFromDefinition, { StyleDefinition, StyleRules } from "./constructStyleFromDefinition"

export type Scales = Record<string, string | MediaList>;

export type StyleSheetDefinition = {
  directives?: string[]; // Directives start with @
  hostRules?: StyleRules;
  childRules?: StyleRules;
  rules?: StyleRules;
  media?: MediaList | string;
  selector?: string;
}

const reduceStyles = (scales: Scales) =>
  (def: StyleSheetDefinition, [ key, value ]: [string, StyleRules | StyleDefinition | string]): StyleSheetDefinition => {
    if (!value) return def

    // Extract Directives
    if ("@" === key[0]) {
      const { directives = [] } = def

      if ("string" === typeof value) {
        directives.push(`${key} ${value}`)
      } else {
        const directiveRule = Object.entries(value)
          .reduce((directive: string, [ directiveName, definition ]: [string, StyleDefinition]): string =>
            `${directive} ${directiveName} {${constructStyleFromDefinition(definition)}}\n`, "")


        directives.push(`${key} {\n${directiveRule}\n}`)
      }

      return { ...def, directives }
    }


    // Extract :host... styles: i.e. :host(class_on_host), :host:after, :host .child
    if ([ "(", ":", " ", "&" ].includes(key[0]) || "-context" === key) {
      const { hostRules = {} } = def
      const selector = "&" === key[0] ? key.substring(1) : key

      return { ...def, hostRules: { ...hostRules, [selector]: <StyleDefinition>value } }
    }

    // Extract child styles: <child-element>
    if ("<" === key[0]) {
      const { childRules = {} } = def
      const selector = key.substring(1, key.lastIndexOf(">")).trim()

      return { ...def, childRules: { ...childRules, [selector]: <StyleDefinition>value } }
    }

    // Extract styles for scales
    if (key in scales) {
      const scaleStyleDefinitions = Object.entries(value).reduce(reduceStyles({}), {});
      return { ...def, [key]: scaleStyleDefinitions }
    }

    // Extract regular css rules for use within a selector
    const { rules = {} } = def
    const constructedDefinition: StyleSheetDefinition = { ...def, rules: { ...rules, [key]: <StyleDefinition>value } };

    return constructedDefinition;
  }

const stringifyStyle = selector => ([ innerSelector, rules ]) =>
  `${selector}${innerSelector} {
    ${constructStyleFromDefinition(rules)}
  }`

const buildStyleSheet = ({ rules, hostRules = {}, childRules = {}, media, selector = ":host", directives = [] }: StyleSheetDefinition) => {
  const styleSheet = new CSSStyleSheet()
  if (media) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    styleSheet.media = media
  }

  const selectorBody = rules && constructStyleFromDefinition(rules)
  const wrappedSelectorBody = Object.entries(hostRules)
    .filter(([ key, rule ]) => key && ("undefined" !== typeof rule || null !== rule))
    .map(stringifyStyle(selector))
  const childSelectorBody = Object.entries(childRules).reduce((ruleBodies, [ selector, rules]: [string, StyleDefinition]) => {
    if (!selector || !rules || typeof rules === 'string' || Array.isArray(rules)) return ruleBodies;

    ruleBodies.push(`${selector} {
      ${constructStyleFromDefinition(rules)}
    }`);

    return ruleBodies;
  }, [])


  if (!selectorBody && !wrappedSelectorBody.length && !childSelectorBody.length && !directives.length) return

  const insertRule = rule => !!rule && styleSheet.insertRule(rule)

  directives.forEach(insertRule)

  if (selector) {
    insertRule(`${selector} {
      ${selectorBody}
    }`)
  }

  wrappedSelectorBody.forEach(insertRule)
  childSelectorBody.forEach(insertRule)

  return styleSheet
}

export default (definition: Record<string, StyleRules | StyleDefinition | string> | undefined, scales: Scales = {}, selector = ":host") => {
  if (!definition) return [];

  const { directives, hostRules, childRules, rules, ...scaleRules } = Object.entries(definition)
    .reduce(reduceStyles(scales), {
      directives: [],
      hostRules: {},
      childRules: {},
      rules: {}
    });
  const computedStyleSheets = [ buildStyleSheet({ selector, rules, hostRules, childRules, directives }) ]
  const scaleStyleSheets = Object.entries(scaleRules)
    .reduce((styleSheets: StyleSheet[], [ scale, { rules = {}, hostRules = {}, childRules = {}, directives = [] } ]: [string, StyleSheetDefinition]) => {
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