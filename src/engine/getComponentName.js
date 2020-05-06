export default (component) => {
  if (component.type) {
    component.type.styleName || component.type.displayName
  }

  return component.styleEngineTag
}