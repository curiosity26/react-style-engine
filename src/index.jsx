import React, { createContext, useContext, useState, useEffect, forwardRef } from "react"
import PropTypes                                                             from "prop-types"
import createStyleEngine                                                     from "./engine/createStyleEngine"

const StyleContext = createContext()

export const StyleProvider = ({ globalStyles = {}, componentStyles = {}, scales: defaultScales = {}, children }) => {
  const [ global, setGlobalStyles ] = useState(globalStyles)
  const [ components, setComponentsStyles ] = useState(componentStyles)
  const [ scales, setScales ] = useState(defaultScales)
  const engine = createStyleEngine({
    global,
    components,
    scales,
    setGlobalStyles,
    setComponentsStyles,
    setScales,
  })

  return <StyleContext.Provider value={ engine }>
    { children }
  </StyleContext.Provider>
}

StyleProvider.propTypes = {
  globalStyles: PropTypes.object,
  componentStyles: PropTypes.object,
  scales: PropTypes.object,
  children: PropTypes.node,
}

export const StyleConsumer = StyleContext.Consumer

export const useStyleEngine = () => useContext(StyleContext)

export const applyGlobalStylesShadowDOM = (target) => {
  target = target || document

  if (!document.adoptedStyleSheets) {
    throw new Error("Global styles cannot by bound to a target which does not support Shadow DOM")
  }

  const styleEngine = useStyleEngine()
  const globalStyles = useStyleEngine().getGlobalStyles()

  useEffect(() => {
    target.adoptedStyleSheets = styleEngine.computeGlobalStyleSheets()
  }, [ target, globalStyles ])
}

const processStyle = (style, props = {}) => "function" === typeof style ? style(props) : style

export const withStyle = (
  Component,
  { attributeName = "style", styleEngineTag, style = {} } = {},
) => {
  if (styleEngineTag) {
    Component.styleEngineTag = styleEngineTag
  }

  const WrappedComponent = forwardRef(({ style: styleOverride = {}, ...props }, ref) => {
    const compProps = { ...(props || {}) }
    const styleEngine = useStyleEngine()
    useEffect(() => {
      styleEngine.addComponentStyle(Component, processStyle(style, compProps)).save()
    }, [style, compProps])

    const defaultStyle = styleEngine.getComponentStyleDefinition(Component)
    compProps[ attributeName ] = { ...defaultStyle, ...styleOverride }

    return <Component { ...compProps } ref={ ref }/>
  })

  WrappedComponent.defaultProps = Component.defaultProps
  WrappedComponent.displayName = Component.displayName
  WrappedComponent.propTypes = {
    ...(Component.propTypes || {}),
    style: PropTypes.object,
  }

  return WrappedComponent
}

export const withStyleSheets = (
  Component,
  { attributeName = "styleSheets", styleEngineTag, style = {} } = {},
) => {
  if (styleEngineTag) {
    Component.styleEngineTag = styleEngineTag
  }

  const WrappedComponent = forwardRef(({ style: styleOverride = {}, ...props }, ref) => {
    const compProps = { ...(props || {}) }
    const styleEngine = useStyleEngine()
    useEffect(() => {
      styleEngine.addComponentStyle(Component, processStyle(style, compProps)).save()
    }, [ style, compProps ])

    // Since computed style sheets are memoized, compute the stylesheets for the component first
    // The component is likely to be reused many times so this will optimize component loading
    // by using the already computed stylesheets on n + 1 uses
    compProps[ attributeName ] = styleEngine.computeStyleSheets(Component)

    if (Object.keys(styleOverride).length) {
      // Since memoization is based on the style definition, even overrides can
      // get a speed boost where the same style overrides are reused, even across components
      compProps[ attributeName ] = compProps[ attributeName ].concat(styleEngine.computeStyleSheets(styleOverride))
    }

    return <Component { ...compProps } ref={ ref }/>
  })

  WrappedComponent.defaultProps = Component.defaultProps
  WrappedComponent.displayName = Component.displayName
  WrappedComponent.propTypes = {
    ...(Component.propTypes || {}),
    style: PropTypes.object,
  }

  return WrappedComponent
}