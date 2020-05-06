import getComponentName           from "./getComponentName"
import constructStyleSheets       from "./constructStyleSheets"
import constructGlobalStyleSheets from "./constructGlobalStyleSheets"
import memoize                    from "./memoize"

const memoizedConstructGlobalStyleSheets = memoize(constructGlobalStyleSheets)
const memoizedConstructStyleSheets = memoize(constructStyleSheets)

export default ({
  global = {},
  components = {},
  scales = {},
  setGlobalStyles = () => {},
  setComponentsStyles = () => {},
  setScales = () => {},
}) => {
  let pendingGlobals = Object.assign(global)
  let pendingComponents = Object.assign(components)
  let pendingScales = Object.assign(scales)

  return {
    addGlobalStyle(selector, style) {
      if ("string" !== typeof selector) {
        throw new Error("CSS Selector must be a string")
      }

      if ("object" !== typeof style) {
        throw new Error("Defined style must be an object")
      }

      pendingGlobals[ selector ] = Object.assign({}, style)

      return this
    },
    addComponentStyle(component, style) {

      const componentName = getComponentName(component)
      if (!componentName) {
        throw new Error("Component must be a valid React component or the name of a valid React component.")
      }

      pendingComponents[ componentName ] = Object.assign({}, style)

      return this
    },
    addScale(alias, mediaQuery) {
      pendingScales[ alias ] = mediaQuery

      return this
    },
    getGlobalStyles() {
      return global
    },
    getComponentName,
    getComponentStyleDefinition(component) {
      const componentName = getComponentName(component)

      if (!componentName) {
        throw new Error("Component must be a valid React component or the name of a valid React component.")
      }

      return components[ componentName ]
    },
    getScales() {
      return scales
    },
    getScale(alias) {
      return scales[ alias ]
    },
    computeGlobalStyleSheets() {
      return memoizedConstructGlobalStyleSheets(global, scales)
    },
    computeStyleSheets(Component) {
      const isRenderable = "function" === typeof Component
                           || ("object" === typeof Component && Component.hasOwnProperty("$$typeof"))
      const definition = isRenderable ? this.getComponentStyleDefinition(Component) : Component

      return memoizedConstructStyleSheets(definition, scales)
    },
    clearGlobalStyleChanges() {
      pendingGlobals = Object.assign(global)

      return this
    },
    clearComponentStyleChanges() {
      pendingComponents = Object.assign(components)

      return this
    },
    clearScaleChanges() {
      pendingScales = Object.assign(scales)

      return this
    },
    clear() {
      return this.clearGlobalStyleChanges()
                 .clearComponentStyleChanges()
                 .clearScaleChanges()
    },
    save() {
      const updatedGlobals = Object.assign(global, pendingGlobals)
      const updatedComponents = Object.assign(components, pendingComponents)
      const updatedScales = Object.assign(scales, pendingScales)

      if (!Object.is(updatedGlobals, global)) {
        setGlobalStyles(updatedGlobals)
      }

      if (!Object.is(updatedComponents, components)) {
        setComponentsStyles(updatedComponents)
      }

      if (!Object.is(updatedScales, scales)) {
        setScales(updatedScales)
      }
    },
  }
}