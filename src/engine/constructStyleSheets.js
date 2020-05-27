import constructStyleFromDefinition from "./constructStyleFromDefinition"

const reduceStyles = scales => (def = { directives: [], hostRules: {}, childRules: {}, rules: {} }, [ key, value ]) => {
  if ("undefined" === typeof value || null === value) return def

  // Extract Directives
  if ("@" === key[ 0 ]) {
    const { directives = [] } = def

    return {
      ...def, directives: [ ...directives, `${ key } ${
        // In the case of key being @keyframes, the value should be an object
        "object" === typeof value
          ? `{\n${ Object.entries(value)
                       .reduce((s, [ f, v ]) => `${ s } ${ f } {${ constructStyleFromDefinition(v) }}\n`, "") }}`
          : value
      };` ],
    }
  }

  // Extract :host... styles: i.e. :host(class_on_host), :host:after, :host .child
  if ([ "(", ":", " ", "&" ].includes(key[ 0 ]) || "-context" === key) {
    const { hostRules = {} } = def
    const selector = "&" === key[ 0 ] ? key.substring(1) : key

    return { ...def, hostRules: { ...hostRules, [ selector ]: value } }
  }

  // Extract child styles: <child-element>
  if ("<" === key[ 0 ]) {
    const { childRules = {} } = def
    const selector = key.substring(1, key.lastIndexOf(">")).trim()

    return { ...def, childRules: { ...childRules, [ selector ]: value } }
  }

  // Extract styles for scales
  if (key in scales) {
    return { ...def, [ key ]: Object.entries(value).reduce(reduceStyles(scales), {}) }
  }

  // Extract regular css rules for use within a selector
  const { rules = {} } = def

  return { ...def, rules: { ...rules, [ key ]: value } }
}

const stringifyStyle = selector => ([ innerSelector, rules ]) =>
  `${ selector }${ innerSelector } {
    ${ constructStyleFromDefinition(rules) }
  }`

const buildStyleSheet = ({ rules, hostRules = {}, childRules = {}, media, selector = ":host", directives = [] }) => {
  const styleSheet = new CSSStyleSheet()
  if (media) styleSheet.media = media

  const selectorBody = rules && constructStyleFromDefinition(rules)
  const wrappedSelectorBody = Object.entries(hostRules)
                                    .filter(([ key, rule ]) => key && ("undefined" !== typeof rule || null !== rule))
                                    .map(stringifyStyle(selector))
  const childSelectorBody = Object.entries(childRules)
                                  .filter(([ selector, rule ]) => selector && ("undefined" !== typeof rule || null !== rule))
                                  .map(([ selector, rules ]) => `${ selector } {
                                            ${ constructStyleFromDefinition(rules) }
                                          }`)


  if (!selectorBody && !wrappedSelectorBody.length && !childSelectorBody.length && !directives.length) return

  const insertRule = rule => !!rule && styleSheet.insertRule(rule)

  directives.forEach(insertRule)

  if (selector) {
    insertRule(`${ selector } {
      ${ selectorBody }
    }`)
  }

  wrappedSelectorBody.forEach(insertRule)
  childSelectorBody.forEach(insertRule)

  return styleSheet
}

export default (definition, scales = {}, selector = ":host") => {
  if (!definition) return [];

  const { directives, hostRules, childRules, rules, ...scaleRules } = Object.entries(definition)
                                                                            .reduce(reduceStyles(scales), {});
  const computedStyleSheets = [ buildStyleSheet({ selector, rules, hostRules, childRules, directives }) ]
  const scaleStyleSheets = Object.entries(scaleRules)
                                 .reduce((styleSheets, [ scale, { rules = {}, hostRules = {}, childRules = {}, directives = [] } ]) => {
                                   if (!Object.keys(rules).length && !Object.keys(hostRules).length && !Object.keys(childRules).length && !directives.length) {
                                     return styleSheets
                                   }

                                   const media = scales[ scale ];

                                   return [
                                     ...styleSheets,
                                     buildStyleSheet({ selector, rules, hostRules, childRules, directives, media }),
                                   ]
                                 }, [])

  return [ ...computedStyleSheets, ...scaleStyleSheets ].filter(sheet => sheet)
}