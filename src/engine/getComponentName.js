export default (component) => {
  if (typeof component === 'string') {
    return component
  }

  if (component.type) {
    return component.type.styleName || component.type.displayName || component.styleEngineTag
  }

  return component.styleEngineTag
}