import hyphenateStyleName from "./hyphenateStyleName"

const convertStyle = (field, value) => {
  if ("function" === typeof value) return convertStyle(value())
  if (Array.isArray(value)) return `${ hyphenateStyleName(field) }: ${ value.join(" ") };\n`

  if ("object" === typeof value) {
    return Object.entries(value)
                 .map(([ key, rule ]) =>
                   rule && `${ field }-${ hyphenateStyleName(key) }: ${ rule };`)
                 .filter(rule => rule)
                 .join("\n")
  }

  try {
    return `${ hyphenateStyleName(field) }: ${ value };\n`
  } catch (e) {
    // log but don't throw the error
    console.error(e)
  }
}

export default (definition = {}) =>
  Object.entries(definition)
        .filter(([ , value ]) => "undefined" !== typeof value && null !== value)
        .reduce((style, [ field, value ]) => style + convertStyle(field, value), "")