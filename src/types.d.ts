import * as React from 'react';

export type Scales = Record<string, string | MediaList>;
export type StyleDefinitionFunc = () => string;
export type StyleDefinitionObject = string | string[] | number | number[] | boolean | StyleDefinitionFunc;
export type StyleDefinition = Record<string, StyleDefinitionObject | Record<string, StyleDefinitionObject>> | StyleDefinitionFunc | StyleDefinitionObject;
export type StyleRules = Record<string, StyleDefinition>;

export type ConstructableStyleSheet = Omit<CSSStyleSheet, 'media'> & { media: string | MediaList }

// eslint-disable-next-line @typescript-eslint/ban-types
export type StyleEngineComponent<P = { ref?: React.Ref<unknown>, style?: StyleDefinition }> = (React.ComponentType<P>) & {
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
  addGlobalStyle: (selector: string, style: StyleRules) => StyleEngine;
  addComponentStyle: (component: string | StyleEngineComponent, style: StyleRules) => StyleEngine;
  addScale: (alias: string, mediaQuery: string | MediaList) => StyleEngine;
  getGlobalStyles: () => StyleRules;
  getComponentStyleDefinition: (component: StyleEngineComponent) => StyleRules;
  getScales: () => Scales;
  getScale: (alias: string) => string | MediaList;
  computeGlobalStyleSheets: () => ConstructableStyleSheet[];
  computeStyleSheets: (Component: StyleEngineComponent | React.ElementType | StyleRules) => ConstructableStyleSheet[];
  clearGlobalStyleChanges: () => StyleEngine;
  clearComponentStyleChanges: () => StyleEngine;
  clearScaleChanges: () => StyleEngine;
  clear: () => StyleEngine;
  save: () => void;
}
