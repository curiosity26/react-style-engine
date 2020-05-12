"use strict"

import createStyleEngine from "../../src/engine/createStyleEngine"

const MyComponent = () => {}
MyComponent.styleEngineTag = "MyComponent"

describe("Create Style Engine", () => {
  let styleEngine
  let getGlobalStyles
  let getComponentsStyles
  let getScales
  let setGlobalStyles
  let setComponentsStyles
  let setScales

  beforeEach(() => {
    let global = {}
    let components = {}
    let scales = {}

    getGlobalStyles = jest.fn(() => global)
    getComponentsStyles = jest.fn(() => components)
    getScales = jest.fn(() => scales)
    setGlobalStyles = jest.fn(gs => Object.assign(global, gs))
    setComponentsStyles = jest.fn(comp => Object.assign(components, comp))
    setScales = jest.fn(sc => Object.assign(scales, sc))

    styleEngine = createStyleEngine({
      getGlobalStyles,
      getComponentsStyles,
      getScales,
      setGlobalStyles,
      setComponentsStyles,
      setScales,
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe("when making updates", () => {
    it("should not fire sets on save if no changes", () => {
      styleEngine.save()

      expect(getGlobalStyles).toHaveBeenCalled()
      expect(getComponentsStyles).toHaveBeenCalled()
      expect(getScales).toHaveBeenCalled()
      expect(setGlobalStyles).not.toHaveBeenCalled()
      expect(setScales).not.toHaveBeenCalled()
      expect(setComponentsStyles).not.toHaveBeenCalled()
    })

    describe("to global styles", () => {
      it("should add global styles when saved", () => {
        styleEngine.addGlobalStyle("body", { fontStyle: "sans-serif" })

        expect(styleEngine.getGlobalStyles()).toEqual({})

        styleEngine.save()

        expect(styleEngine.getGlobalStyles()).toEqual({
          body: {
            fontStyle: "sans-serif"
          }
        })

        expect(getGlobalStyles).toHaveBeenCalled()
        expect(getComponentsStyles).toHaveBeenCalled()
        expect(getScales).toHaveBeenCalled()
        expect(setGlobalStyles).toHaveBeenCalled()
        expect(setScales).not.toHaveBeenCalled()
        expect(setComponentsStyles).not.toHaveBeenCalled()
      })

      it("should throw if selector is not a string", () => {
        expect(() => styleEngine.addGlobalStyle({}, {})).toThrowError("CSS Selector must be a string")
      })

      it("should throw if style is not an object", () => {
        expect(() => styleEngine.addGlobalStyle("body", "font-size: 12px;"))
        .toThrowError("Defined style must be an object")
      })
    })

    describe("to component styles", () => {
      it("should add component styles when saved", () => {

        styleEngine.addComponentStyle("MyComponent", { fontStyle: "sans-serif" })

        expect(styleEngine.getComponentStyleDefinition(MyComponent)).toBeUndefined()

        styleEngine.save()

        expect(styleEngine.getComponentStyleDefinition(MyComponent)).toEqual({
          fontStyle: "sans-serif"
        })

        expect(getGlobalStyles).toHaveBeenCalled()
        expect(getComponentsStyles).toHaveBeenCalled()
        expect(getScales).toHaveBeenCalled()
        expect(setGlobalStyles).not.toHaveBeenCalled()
        expect(setScales).not.toHaveBeenCalled()
        expect(setComponentsStyles).toHaveBeenCalled()
      })

      it("should throw an error when component styleEngineTag is not set", () => {
        const BadComponent = () => {}
        expect(() => styleEngine.addComponentStyle(BadComponent, { fontSize: "12px" }))
        .toThrowError("Component must be a valid React component or the name of a valid React component.")
        expect(() => styleEngine.getComponentStyleDefinition(BadComponent))
        .toThrowError("Component must be a valid React component or the name of a valid React component.")
      })
    })

    describe("scales", () => {
      it("should add scales when saved", () => {

        styleEngine.addScale("2x", "(min-resolution: 144dpi)")

        expect(styleEngine.getScales()).toEqual({})

        styleEngine.save()

        expect(styleEngine.getScales()).toEqual({
          "2x": "(min-resolution: 144dpi)"
        })

        expect(styleEngine.getScale("2x")).toEqual("(min-resolution: 144dpi)")

        expect(getGlobalStyles).toHaveBeenCalled()
        expect(getComponentsStyles).toHaveBeenCalled()
        expect(getScales).toHaveBeenCalled()
        expect(setGlobalStyles).not.toHaveBeenCalled()
        expect(setScales).toHaveBeenCalled()
        expect(setComponentsStyles).not.toHaveBeenCalled()
      })
    })
  })

  describe("when clearing updates", () => {

    describe("on globals", () => {
      it("should reset global styles", () => {
        styleEngine.addGlobalStyle("body", { fontStyle: "sans-serif" })
                   .clearGlobalStyleChanges()
                   .save()

        expect(styleEngine.getGlobalStyles()).toEqual({})
      })

      it("should reset only global styles", () => {
        styleEngine.addGlobalStyle("body", { fontStyle: "sans-serif" })
                   .addComponentStyle(MyComponent, { color: "blue" })
                   .addScale("2x", "(min-resolution: 144dpi)")
                   .clearGlobalStyleChanges()
                   .save()

        expect(getGlobalStyles).toHaveBeenCalled()
        expect(getComponentsStyles).toHaveBeenCalled()
        expect(getScales).toHaveBeenCalled()
        expect(styleEngine.getGlobalStyles()).toEqual({})
        expect(styleEngine.getComponentStyleDefinition(MyComponent)).toEqual({ color: "blue" })
        expect(styleEngine.getScales()).toEqual({ "2x": "(min-resolution: 144dpi)" })
      })
    });

    describe("on component styles", () => {
      it("should reset component styles", () => {
        styleEngine.addComponentStyle(MyComponent, { color: "blue" })
                   .clearComponentStyleChanges()
                   .save()

        expect(getGlobalStyles).toHaveBeenCalled()
        expect(getComponentsStyles).toHaveBeenCalled()
        expect(getScales).toHaveBeenCalled()
        expect(styleEngine.getComponentStyleDefinition(MyComponent)).toBeUndefined()
      })

      it("should reset only component styles", () => {
        styleEngine.addGlobalStyle("body", { fontStyle: "sans-serif" })
                   .addComponentStyle(MyComponent, { color: "blue" })
                   .addScale("2x", "(min-resolution: 144dpi)")
                   .clearComponentStyleChanges()
                   .save()

        expect(getGlobalStyles).toHaveBeenCalled()
        expect(getComponentsStyles).toHaveBeenCalled()
        expect(getScales).toHaveBeenCalled()
        expect(styleEngine.getGlobalStyles()).toEqual({
          body: {
            fontStyle: "sans-serif",
          }
        })
        expect(styleEngine.getComponentStyleDefinition(MyComponent)).toBeUndefined()
        expect(styleEngine.getScales()).toEqual({ "2x": "(min-resolution: 144dpi)" })
      })
    })

    describe("on scales", () => {
      it("should reset scales", () => {
        styleEngine.addScale("2x", "(min-resolution: 144dpi)")
                   .clearScaleChanges()
                   .save()

        expect(getGlobalStyles).toHaveBeenCalled()
        expect(getComponentsStyles).toHaveBeenCalled()
        expect(getScales).toHaveBeenCalled()
        expect(styleEngine.getScales()).toEqual({})
      })

      it("should reset only scales", () => {
        styleEngine.addGlobalStyle("body", { fontStyle: "sans-serif" })
                   .addComponentStyle(MyComponent, { color: "blue" })
                   .addScale("2x", "(min-resolution: 144dpi)")
                   .clearScaleChanges()
                   .save()

        expect(getGlobalStyles).toHaveBeenCalled()
        expect(getComponentsStyles).toHaveBeenCalled()
        expect(getScales).toHaveBeenCalled()
        expect(styleEngine.getGlobalStyles()).toEqual({
          body: {
            fontStyle: "sans-serif",
          }
        })
        expect(styleEngine.getComponentStyleDefinition(MyComponent)).toEqual({ color: "blue" })
        expect(styleEngine.getScales()).toEqual({})
      })
    });

    it("should reset all", () => {
      styleEngine.addGlobalStyle("body", { fontStyle: "sans-serif" })
                 .addComponentStyle(MyComponent, { color: "blue" })
                 .addScale("2x", "(min-resolution: 144dpi)")
                 .clear()
                 .save()

      expect(getGlobalStyles).toHaveBeenCalled()
      expect(getComponentsStyles).toHaveBeenCalled()
      expect(getScales).toHaveBeenCalled()
      expect(styleEngine.getGlobalStyles()).toEqual({})
      expect(styleEngine.getComponentStyleDefinition(MyComponent)).toBeUndefined()
      expect(styleEngine.getScales()).toEqual({})
    })
  })

  describe("computes style sheets", () => {
    it("for global styles", () => {
      styleEngine.addGlobalStyle("body", {
                   fontFamily: "sans-serif",
                   fontSize: "12px",
                 })
                 .save()

      const styleSheets = styleEngine.computeGlobalStyleSheets()
      expect(getGlobalStyles).toHaveBeenCalled()
      expect(getComponentsStyles).toHaveBeenCalled()
      expect(getScales).toHaveBeenCalled()

      expect(styleSheets).toHaveLength(1)

      const [ styleSheet ] = styleSheets
      expect(styleSheet).toBeInstanceOf(CSSStyleSheet)
      expect(styleSheet.cssRules).toHaveLength(1)

      const [ cssRule ] = styleSheet.cssRules
      expect(cssRule).toBeInstanceOf(CSSRule)
      expect(cssRule.cssText).toEqual("body {font-family: sans-serif; font-size: 12px;}")
    })

    it("for global styles with multiple media", () => {
      styleEngine.addGlobalStyle("body", {
                   fontFamily: "sans-serif",
                   fontSize: "12px",
                   "2x": {
                     fontSize: "14px",
                   }
                 })
                 .addScale("2x", "(min-resolution: 144dpi)")
                 .save()

      const styleSheets = styleEngine.computeGlobalStyleSheets()

      expect(styleSheets).toHaveLength(2)

      const [ styleSheet, styleSheet2x ] = styleSheets
      expect(styleSheet).toBeInstanceOf(CSSStyleSheet)
      expect(styleSheet2x).toBeInstanceOf(CSSStyleSheet)
      expect(styleSheet.cssRules).toHaveLength(1)
      expect(styleSheet2x.cssRules).toHaveLength(1)
      expect(styleSheet2x.media).toEqual("(min-resolution: 144dpi)")

      const [ cssRule ] = styleSheet.cssRules
      expect(cssRule).toBeInstanceOf(CSSRule)
      expect(cssRule.cssText).toEqual("body {font-family: sans-serif; font-size: 12px;}")

      const [ cssRule2x ] = styleSheet2x.cssRules
      expect(cssRule2x).toBeInstanceOf(CSSRule)
      expect(cssRule2x.cssText).toEqual("body {font-size: 14px;}")

      expect(getGlobalStyles).toHaveBeenCalled()
      expect(getComponentsStyles).toHaveBeenCalled()
      expect(getScales).toHaveBeenCalled()

    })

    it("for component styles", () => {
      styleEngine.addComponentStyle(MyComponent, {
                   fontSize: "12px"
                 })
                 .save()

      const styleSheets = styleEngine.computeStyleSheets(MyComponent)

      expect(styleSheets).toHaveLength(1)

      const [ styleSheet ] = styleSheets
      expect(styleSheet).toBeInstanceOf(CSSStyleSheet)
      expect(styleSheet.cssRules).toHaveLength(1)

      const [ cssRule ] = styleSheet.cssRules
      expect(cssRule).toBeInstanceOf(CSSRule)
      expect(cssRule.cssText).toEqual(":host {font-size: 12px;}")

      expect(getGlobalStyles).toHaveBeenCalled()
      expect(getComponentsStyles).toHaveBeenCalled()
      expect(getScales).toHaveBeenCalled()
    })

    it("for component styles with multiple media", () => {
      styleEngine.addComponentStyle(MyComponent, {
                   fontSize: "12px",
                   "2x": {
                     fontSize: "14px",
                   }
                 })
                 .addScale("2x", "(min-resolution: 144dpi)")
                 .save()

      const styleSheets = styleEngine.computeStyleSheets(MyComponent)

      expect(styleSheets).toHaveLength(2)

      const [ styleSheet, styleSheet2x ] = styleSheets
      expect(styleSheet).toBeInstanceOf(CSSStyleSheet)
      expect(styleSheet2x).toBeInstanceOf(CSSStyleSheet)
      expect(styleSheet.cssRules).toHaveLength(1)
      expect(styleSheet2x.cssRules).toHaveLength(1)
      expect(styleSheet2x.media).toEqual("(min-resolution: 144dpi)")

      const [ cssRule ] = styleSheet.cssRules
      expect(cssRule).toBeInstanceOf(CSSRule)
      expect(cssRule.cssText).toEqual(":host {font-size: 12px;}")

      const [ cssRule2x ] = styleSheet2x.cssRules
      expect(cssRule2x).toBeInstanceOf(CSSRule)
      expect(cssRule2x.cssText).toEqual(":host {font-size: 14px;}")

      expect(getGlobalStyles).toHaveBeenCalled()
      expect(getComponentsStyles).toHaveBeenCalled()
      expect(getScales).toHaveBeenCalled()
    })
  })
})