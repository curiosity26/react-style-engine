import constructStyleSheets from "./constructStyleSheets"

export default (global, scales = {}) => {
  let styleSheets = []

  for (const selector in global) {
    if (!global.hasOwnProperty(selector)) continue;

    const definition = global[ selector ]

    if (!definition) continue;

    styleSheets = [...styleSheets, ...constructStyleSheets(definition, scales, selector)]
  }

  return styleSheets
}