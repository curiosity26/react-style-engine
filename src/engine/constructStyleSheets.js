import constructStyleFromDefinition from "./constructStyleFromDefinition"

const reduceStyles = scales => (def = { directives: [], hostRules: {}, childRules: {}, rules: {} }, [ key, value ]) => {
  if ("undefined" === typeof value || null === value) return def

  // Extract Directives
  if ("@" === key[ 0 ]) {
    const { directives = [] } = def

    return {
      ...def, directives: [ ...directives, `${ key } ${
        // In the case of key being @keyframes, the value should be an object
        "object" === typeof value ? constructStyleFromDefinition(value) : value
      };` ],
    }
  }

  // Extract :host... styles: i.e. :host(class_on_host), :host:after, :host .child
  if ([ "(", ":", " ", "&" ].includes(key[ 0 ])) {
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
    return { ...def, [ key ]: Object.entries(value).reduce(reduceStyles(scales)) }
  }

  // Extract regular css rules for use within a selector
  const { rules = {} } = def

  return { ...def, rules: { ...rules, [ key ]: value } }
}

const stringifyStyle = selector => ([ innerSelector, rules ]) =>
  `${ selector }${ innerSelector } {
    ${ constructStyleFromDefinition(rules) }
  }`

const tryCatch = fn => (...props) => {
  try {
    fn(...props)
  } catch (e) {
    // Suppress error, but log it
    console.error(e)
  }
}

const buildStyleSheet = ({ rules, hostRules = {}, childRules = {}, media, selector = ":host", directives = [] }) => {
  const styleSheet = new CSSStyleSheet()
  if (media) styleSheet.media = media

  const selectorBody = constructStyleFromDefinition(rules)
  const wrappedSelectorBody = Object.entries(hostRules)
                                    .filter(([ key, rule ]) => key && ("undefined" !== typeof rule || null !== rule))
                                    .map(stringifyStyle(selector))
  const childSelectorBody = Object.entries(childRules)
                                  .filter(([ selector, rule ]) => selector && ("undefined" !== typeof rule || null !== rule))
                                  .map(([ selector, rules ]) => `${selector} {
                                            ${ constructStyleFromDefinition(rules) }
                                          }`)


  if (!selectorBody && !wrappedSelectorBody.length && !childSelectorBody.length) return

  const insertRule = tryCatch(rule => styleSheet.insertRule(rule))

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
  const { directives, hostRules, childRules, rules, ...scaleRules } = Object.entries(definition)
                                                                            .reduce(reduceStyles(scales), {});
  const computedStyleSheets = [ buildStyleSheet({ selector, rules, hostRules, childRules, directives }) ]
  const scaleStyleSheets = Object.entries(scaleRules)
                                 .reduce((styleSheets, [ scale, { rules, hostRules, childRules } ]) => {
                                   if (Object.is({}, rules) && Object.is({}, hostRules) && Object.is({}, childRules)) {
                                     return styleSheets
                                   }

                                   const media = scales[ scale ];

                                   return [
                                     ...styleSheets,
                                     buildStyleSheet({ selector, rules, hostRules, childRules, media }),
                                   ]
                                 }, [])

  return computedStyleSheets.concat(scaleStyleSheets).filter(sheet => sheet)
}