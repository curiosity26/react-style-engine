import * as React from 'react'
import * as PropTypes from 'prop-types'
import createStyleEngine from './engine/createStyleEngine'
import {
  ConstructableStyleSheet,
  Scales,
  StyleDefinition,
  StyleEngine,
  StyleEngineComponent,
  StyleEngineWrappedComponentsParams,
  StyleRules,
} from './types';

const { createContext, useContext, useEffect, forwardRef } = React;

const StyleContext = createContext<StyleEngine>(createStyleEngine({
  getGlobalStyles: () => ({}),
  getComponentsStyles: () => ({}),
  getScales: () => ({}),
  setGlobalStyles: () => {},
  setComponentsStyles: () => {},
  setScales: () => {},
}))

type StyleProviderParams = {
  globalStyles?: StyleRules;
  componentStyles?: StyleRules;
  scales?: Scales;
  children?: React.ReactChild;
}

export const StyleProvider = ({
  globalStyles = {},
  componentStyles = {},
  scales: defaultScales = {},
  children,
}: StyleProviderParams): React.ReactElement<React.Provider<StyleEngine>> => {
  const global = Object.assign({}, globalStyles);
  const components = Object.assign({}, componentStyles);
  const scales = Object.assign({}, defaultScales);

  const styles = {
    global,
    components,
    scales,
  }

  const engine = createStyleEngine({
    getGlobalStyles: () => styles.global,
    getComponentsStyles: () => styles.components,
    getScales: () => styles.scales,
    setGlobalStyles: (updated) => styles.global = updated,
    setComponentsStyles: (updated) => styles.components = updated,
    setScales: (updated) => styles.scales = updated,
  })

  return <StyleContext.Provider value={ engine }>
    {children}
  </StyleContext.Provider>
}

StyleProvider.propTypes = {
  globalStyles: PropTypes.object,
  componentStyles: PropTypes.object,
  scales: PropTypes.object,
  children: PropTypes.node,
}

export const StyleConsumer = StyleContext.Consumer

export const useStyleEngine = (): StyleEngine => useContext(StyleContext)

const processStyle = (style, props = {}) => 'function' === typeof style ? style(props) : style

type WithStyleParams = {
  attributeName?: string;
  styleEngineTag?: string;
  style?: StyleRules
}

export const withStyle = (
  Component: StyleEngineComponent,
  { attributeName = 'style', styleEngineTag, style = {} }: WithStyleParams = {},
): React.ForwardRefExoticComponent<React.PropsWithRef<StyleEngineWrappedComponentsParams>> => {
  Component.styleEngineTag = Component.styleEngineTag || styleEngineTag || Component.displayName || Component.name

  const WrappedComponent = forwardRef(({ style: styleOverride = {}, ...props }: StyleEngineWrappedComponentsParams, ref) => {
    const compProps = { ...(props || {}) }
    const styleEngine = useStyleEngine()
    useEffect(() => {
      styleEngine.addComponentStyle(Component, processStyle(style, compProps)).save()
    }, [ style, compProps ])

    const defaultStyle: StyleRules = styleEngine.getComponentStyleDefinition(Component)
    compProps[attributeName] = { ...defaultStyle, ...styleOverride }

    return <Component { ...compProps } ref={ ref }/>
  })

  WrappedComponent.defaultProps = Component.defaultProps
  WrappedComponent.displayName = `withStyles(${ Component.styleEngineTag })`
  WrappedComponent.propTypes = {
    ...(Component.propTypes || {}),
    style: PropTypes.object,
  }

  return WrappedComponent
}

type WithStyleSheetsOptions = {
  readonly attributeName?: string;
  readonly styleEngineTag?: string;
  readonly style?: StyleDefinition;
}

export const withStyleSheets = (
  Component: StyleEngineComponent,
  { attributeName = 'styleSheets', styleEngineTag = '', style = {} }: WithStyleSheetsOptions = {},
): React.ForwardRefExoticComponent<React.PropsWithRef<StyleEngineWrappedComponentsParams>> => {
  Component.styleEngineTag = Component.styleEngineTag || styleEngineTag || Component.displayName || Component.name

  const WrappedComponent = forwardRef(({ style: styleOverride = {}, ...props }: StyleEngineWrappedComponentsParams, ref) => {
    const compProps = { ...(props || {}) }
    const defaultStyle = processStyle(style, compProps);

    return <StyleConsumer>{styleEngine => {
      styleEngine.addComponentStyle(Component.styleEngineTag, defaultStyle).save()

      // Since computed style sheets are memoized, compute the stylesheets for the component first
      // The component is likely to be reused many times so this will optimize component loading
      // by using the already computed stylesheets on n + 1 uses
      compProps[attributeName] = styleEngine.computeStyleSheets(Component)

      if (Object.keys(styleOverride).length) {
        // Since memoization is based on the style definition, even overrides can
        // get a speed boost where the same style overrides are reused, even across components
        const originalStyleSheets = compProps[attributeName] as ConstructableStyleSheet[];
        compProps[attributeName] = originalStyleSheets.concat(styleEngine.computeStyleSheets(styleOverride))
      }

      return <Component { ...compProps } ref={ ref }/>
    }}</StyleConsumer>
  })

  WrappedComponent.defaultProps = Component.defaultProps
  WrappedComponent.displayName = `withStyleSheets(${Component.styleEngineTag})`
  WrappedComponent.propTypes = {
    ...(Component.propTypes || {}),
    style: PropTypes.object,
  }

  return WrappedComponent
}