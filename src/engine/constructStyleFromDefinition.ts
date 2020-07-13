import hyphenateStyleName from "./hyphenateStyleName"

type BaseStyleDefinition = string | string[];
export type StyleDefinitionFunc = () => BaseStyleDefinition;
export type StyleDefinition = BaseStyleDefinition | StyleDefinitionFunc | Record<string, BaseStyleDefinition | StyleDefinitionFunc>;
export type StyleRules = Record<string, StyleDefinition>;

const convertStyle = (field: string, value: StyleDefinition | StyleRules): string => {
  if ("function" === typeof value) return convertStyle(field, value())
  if (Array.isArray(value)) return `${ hyphenateStyleName(field) }: ${ value.join(" ") };\n`

  if ("object" === typeof value) {
    return Object.entries(value)
                 .map(([ key, rule ]) =>
                   rule && `${ field }-${ hyphenateStyleName(key) }: ${ rule };`)
                 .filter(rule => rule)
                 .join("\n") + "\n"
  }

  return `${ hyphenateStyleName(field) }: ${ value };\n`
}

export default (definition: StyleDefinition | StyleRules): string =>
  Object.entries(definition)
        .filter(([ , value ]) => !!value)
        .reduce((style, [ field, value ]) => style + convertStyle(field, value), "")