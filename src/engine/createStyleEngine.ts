import constructStyleSheets  from './constructStyleSheets'
import constructGlobalStyleSheets from './constructGlobalStyleSheets'
import hash    from './hash'
import memoize from './memoize'
import { StyleEngine, StyleRules, Scales, ConstructableStyleSheet, StyleDefinition } from '../types';

const memoizedConstructGlobalStyleSheets = memoize<ConstructableStyleSheet[]>(constructGlobalStyleSheets)
const memoizedConstructStyleSheets = memoize(constructStyleSheets)

type CreateStyleEngineOptions = {
  getGlobalStyles: () =>  StyleDefinition | StyleRules,
  getComponentsStyles: () => StyleDefinition | StyleRules,
  getScales: () => Scales,
  setGlobalStyles: (globalStyles: StyleRules) => void,
  setComponentsStyles: (componentStyles: StyleRules) => void,
  setScales: (scales: Scales) => void,
}

export default ({
  getGlobalStyles,
  getComponentsStyles,
  getScales,
  setGlobalStyles,
  setComponentsStyles,
  setScales,
}: CreateStyleEngineOptions): StyleEngine => {
  let pendingGlobals = Object.assign({}, getGlobalStyles())
  let pendingComponents = Object.assign({}, getComponentsStyles())
  let pendingScales = Object.assign({}, getScales())

  return {
    addGlobalStyle(selector, style) {
      if ('string' !== typeof selector) {
        throw new Error('CSS Selector must be a string')
      }

      if ('object' !== typeof style) {
        throw new Error('Defined style must be an object')
      }

      pendingGlobals[ selector ] = Object.assign({}, style)

      return this
    },
    addComponentStyle(component, style) {
      const { styleEngineTag } = 'string' === typeof component ? { styleEngineTag: component } : component


      if (!styleEngineTag) {
        throw new Error('Component must be a valid React component or the name of a valid React component.')
      }

      pendingComponents[ styleEngineTag ] = Object.assign({}, (pendingComponents[ styleEngineTag ] || {}), style)

      return this
    },
    addScale(alias, mediaQuery) {
      pendingScales[ alias ] = mediaQuery

      return this
    },
    getGlobalStyles: getGlobalStyles as () => StyleRules,
    getComponentStyleDefinition(component) {
      const { styleEngineTag } = component

      if (!styleEngineTag) {
        throw new Error('Component must be a valid React component or the name of a valid React component.')
      }

      const components = getComponentsStyles()

      return components[ styleEngineTag ]
    },
    getScales,
    getScale(alias) {
      const scales = getScales()
      return scales[ alias ]
    },
    computeGlobalStyleSheets() {
      return memoizedConstructGlobalStyleSheets(getGlobalStyles(), getScales())
    },
    computeStyleSheets(Component) {
      const isRenderable = 'function' === typeof Component
                           || ('object' === typeof Component && Component.hasOwnProperty('$$typeof'))
      const definition = isRenderable ? this.getComponentStyleDefinition(Component) : Component

      if (!definition) return []

      return memoizedConstructStyleSheets(definition, getScales())
    },
    clearGlobalStyleChanges() {
      pendingGlobals = Object.assign({}, getGlobalStyles())

      return this
    },
    clearComponentStyleChanges() {
      pendingComponents = Object.assign({}, getComponentsStyles())

      return this
    },
    clearScaleChanges() {
      pendingScales = Object.assign({}, getScales())

      return this
    },
    clear() {
      return this.clearGlobalStyleChanges()
                 .clearComponentStyleChanges()
                 .clearScaleChanges()
    },
    save() {
      const global = getGlobalStyles() as StyleRules
      const components = getComponentsStyles() as StyleRules
      const scales = getScales()

      const updatedGlobals = Object.assign({}, global, pendingGlobals) as StyleRules
      const updatedComponents = Object.assign({}, components, pendingComponents) as StyleRules
      const updatedScales = Object.assign({}, scales, pendingScales)

      if (hash(updatedGlobals) !== hash(global)) {
        setGlobalStyles(updatedGlobals)
      }

      if (hash(updatedComponents) !== hash(components)) {
        setComponentsStyles(updatedComponents)
      }

      if (hash(updatedScales) !== hash(scales)) {
        setScales(updatedScales)
      }
    },
  }
}