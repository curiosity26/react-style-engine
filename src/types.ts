import * as React from 'react';

export type Scales = Record<string, string | MediaList>;
export type StyleDefinitionFunc = () => string;
export type StyleDefinitionObject = string | string[] | number | number[] | boolean | StyleDefinitionFunc;
export type StyleDefinition = Record<string, StyleDefinitionObject | Record<string, StyleDefinitionObject>> | StyleDefinitionFunc | StyleDefinitionObject;
export type StyleRules = Record<string, StyleDefinition>;

export type ConstructableStyleSheet = Omit<CSSStyleSheet, 'media'> & { media: string | MediaList }

export type StyleEngineComponent<P = { style?: StyleDefinition }> = (React.ComponentType<P>) & {
  styleEngineTag?: string;
}

export type StyleEngineWrappedComponentsParams = {
  readonly style?: StyleRules,
  readonly children?: ChildNode,
  readonly [key:string]: unknown,
}

export type StyleEngineDocumentRoot = DocumentOrShadowRoot & {
  adoptedStyleSheets: ConstructableStyleSheet[]
}

export type StyleEngine = {
  readonly addGlobalStyle: (selector: string, style: StyleRules) => StyleEngine;
  readonly addComponentStyle: (component: string | StyleEngineComponent, style: StyleRules) => StyleEngine;
  readonly addScale: (alias: string, mediaQuery: string | MediaList) => StyleEngine;
  readonly getGlobalStyles: () => StyleRules;
  readonly getComponentStyleDefinition: (component: StyleEngineComponent) => StyleRules;
  readonly getScales: () => Scales;
  readonly getScale: (alias: string) => string | MediaList;
  readonly computeGlobalStyleSheets: () => ConstructableStyleSheet[];
  readonly computeStyleSheets: (Component: StyleEngineComponent | React.ElementType | StyleRules) => ConstructableStyleSheet[];
  readonly clearGlobalStyleChanges: () => StyleEngine;
  readonly clearComponentStyleChanges: () => StyleEngine;
  readonly clearScaleChanges: () => StyleEngine;
  readonly clear: () => StyleEngine;
  readonly save: () => void;
}
