"use strict"

import constructGlobalStyleSheets from "../../src/engine/constructGlobalStyleSheets"

describe("constructGlobalStyleSheets", () => {
  it("should return empty array if selector not in global styles", () => {
    const stylesheets = constructGlobalStyleSheets({
      body: undefined,
    }, [])

    expect(stylesheets).toHaveLength(0)
  })

  it("should generate a stylesheet", () => {
    const stylesheets = constructGlobalStyleSheets({
      body: {
        fontSize: "12px",
        color: "blue",
      },
    })

    expect(stylesheets).toHaveLength(1)

    const [ stylesheet ] = stylesheets

    expect(stylesheet).toBeInstanceOf(CSSStyleSheet)
    expect(stylesheet.cssRules).toHaveLength(1)

    const [ rule ] = stylesheet.cssRules

    expect(rule).toBeInstanceOf(CSSRule)
    expect(rule.cssText).toEqual("body {font-size: 12px; color: blue;}")
  })

  it("should generate multiple stylesheets for all scales", () => {
    const stylesheets = constructGlobalStyleSheets({
      body: {
        fontSize: "12px",
        color: "blue",
        "2x": {
          fontSize: "14px",
        },
      },
    },
    {
      "2x": "(min-resolution: 144dpi)",
    })

    expect(stylesheets).toHaveLength(2)

    const [ defaultSheet, hiresSheet ] = stylesheets

    expect(defaultSheet).toBeInstanceOf(CSSStyleSheet)
    expect(defaultSheet.cssRules).toHaveLength(1)

    const [ defRule ] = defaultSheet.cssRules

    expect(defRule).toBeInstanceOf(CSSRule)
    expect(defRule.cssText).toEqual("body {font-size: 12px; color: blue;}")

    expect(hiresSheet).toBeInstanceOf(CSSStyleSheet)
    expect(hiresSheet.cssRules).toHaveLength(1)
    expect(hiresSheet.media).toEqual("(min-resolution: 144dpi)")

    const [ hiresRule ] = hiresSheet.cssRules

    expect(hiresRule).toBeInstanceOf(CSSRule)
    expect(hiresRule.cssText).toEqual("body {font-size: 14px;}")

  })
})