import constructStyleSheets from "./constructStyleSheets"

export default (global, scales = {}) => {
  for (const selector in global) {
    if (!global.hasOwnProperty(selector)) continue;

    const definition = global[ selector ]

    if (!definition) continue;

    return constructStyleSheets(definition, scales, selector)
  }
}