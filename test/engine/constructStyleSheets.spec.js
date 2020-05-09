"use strict"

import constructStyleSheets from "../../src/engine/constructStyleSheets"

describe("constructStyleSheets", () => {
  beforeAll(() => {
    console.error = jest.fn()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it("should return an empty array if definition is undefined", () => {
    expect(constructStyleSheets()).toEqual([])
  })

  it("constructs a basic stylesheet", () => {
    const stylesheets = constructStyleSheets({
      fontSize: "12px",
      color: "blue"
    })

    expect(stylesheets).toHaveLength(1)

    const [ stylesheet ] = stylesheets

    expect(stylesheet).toBeInstanceOf(CSSStyleSheet)
    expect(stylesheet.cssRules).toHaveLength(1)

    const [ rule ] = stylesheet.cssRules

    expect(rule).toBeInstanceOf(CSSRule)
    expect(rule.cssText).toEqual(
      ":host {font-size: 12px; color: blue;}"
    )
  })

  it("constructs a basic stylesheet with selector", () => {
    const stylesheets = constructStyleSheets({
        fontSize: "12px",
        color: "blue"
      },
      [],
      "div"
    )

    expect(stylesheets).toHaveLength(1)

    const [ stylesheet ] = stylesheets

    expect(stylesheet).toBeInstanceOf(CSSStyleSheet)
    expect(stylesheet.cssRules).toHaveLength(1)

    const [ rule ] = stylesheet.cssRules

    expect(rule).toBeInstanceOf(CSSRule)
    expect(rule.cssText).toEqual(
      "div {font-size: 12px; color: blue;}"
    )
  })

  it("constructs stylesheet using child selectors", () => {
    const stylesheets = constructStyleSheets({
      "<.select-child>": {
        color: "red",
        lineHeight: 1.4,
      }
    })

    expect(stylesheets).toHaveLength(1)

    const [ stylesheet ] = stylesheets

    expect(stylesheet).toBeInstanceOf(CSSStyleSheet)
    expect(stylesheet.cssRules).toHaveLength(2)

    const [ rule1, rule2 ] = stylesheet.cssRules

    expect(rule1).toBeInstanceOf(CSSRule)
    expect(rule1.cssText).toEqual(".select-child {color: red; line-height: 1.4;}")

    expect(rule2).toBeInstanceOf(CSSRule)
    expect(rule2.cssText).toEqual(":host {}")
  })

  it("constructs stylesheet with :host appended selector", () => {
    const stylesheets = constructStyleSheets({
      "(.host-class)": {
        fontSize: "12px",
      },
      ":after": {
        content: "\" \"",
      },
      " .subclass": {
        color: "red",
      },
      "&.alt-host-class": {
        fontWeight: "bold",
      },
      "-context": {
        backgroundColor: "blue",
      },
    })

    expect(stylesheets).toHaveLength(1)

    const [ stylesheet ] = stylesheets

    expect(stylesheet).toBeInstanceOf(CSSStyleSheet)
    expect(stylesheet.cssRules).toHaveLength(6)

    const [ rule1, rule2, rule3, rule4, rule5, rule6 ] = stylesheet.cssRules

    expect(rule1).toBeInstanceOf(CSSRule)
    expect(rule1.cssText).toEqual(":host-context {background-color: blue;}")

    expect(rule2).toBeInstanceOf(CSSRule)
    expect(rule2.cssText).toEqual(":host.alt-host-class {font-weight: bold;}")

    expect(rule3).toBeInstanceOf(CSSRule)
    expect(rule3.cssText).toEqual(":host .subclass {color: red;}")

    expect(rule4).toBeInstanceOf(CSSRule)
    expect(rule4.cssText).toEqual(":host:after {content: \" \";}")

    expect(rule5).toBeInstanceOf(CSSRule)
    expect(rule5.cssText).toEqual(":host(.host-class) {font-size: 12px;}")

    expect(rule6).toBeInstanceOf(CSSRule)
    expect(rule6.cssText).toEqual(":host {}")
  })

  it("constructs stylesheet with import", () => {
    const stylesheets = constructStyleSheets({
      "@import": "url(../style.css)"
    })

    expect(stylesheets).toHaveLength(1)

    const [ stylesheet ] = stylesheets

    expect(stylesheet).toBeInstanceOf(CSSStyleSheet)
    expect(stylesheet.cssRules).toHaveLength(2)

    const [ hostRule, importRule ] = stylesheet.cssRules

    expect(importRule).toBeInstanceOf(CSSRule)
    expect(importRule.cssText).toEqual("@import url(../style.css);")

    expect(hostRule).toBeInstanceOf(CSSRule)
    expect(hostRule.cssText).toEqual(":host {}")
  })

  it("constructs a stylesheet with keyframe", () => {
    const stylesheets = constructStyleSheets({
      "@keyframes testAnimation": {
        from: {
          transform: "translateX(0)"
        },
        to: {
          transform: "translateX(100px)"
        }
      }
    })

    expect(stylesheets).toHaveLength(1)

    const [ stylesheet ] = stylesheets

    expect(stylesheet).toBeInstanceOf(CSSStyleSheet)
    expect(stylesheet.cssRules).toHaveLength(2)

    const [ hostRule, keyframeRule ] = stylesheet.cssRules

    expect(hostRule).toBeInstanceOf(CSSRule)
    expect(hostRule.cssText).toEqual(":host {}")

    expect(keyframeRule).toBeInstanceOf(CSSRule)
    expect(keyframeRule.cssText).toEqual("@keyframes testAnimation { \n" +
                                         "  from {transform: translateX(0);} \n" +
                                         "  to {transform: translateX(100px);} \n" +
                                         "}")
  })

  it("constructs stylesheets with multiple scales", () => {
    const stylesheets = constructStyleSheets({
      "backgroundImage": "url(mobile.webp)",
      "desktop": {
        "@keyframes testAnimation": {
          "0%": {
            transform: "rotateZ(0deg)",
          },
          "100%": {
            transform: "rotateZ(360deg)"
          }
        }
      },
      "2x": {
        border: {
          width: "1px",
          style: "solid",
          color: "black",
        }
      }
    }, {
      "desktop": "(min-width: 1024px)",
      "2x": "(min-resolution: 144dpi)"
    })

    expect(stylesheets).toHaveLength(3)

    const [ defaultStyle, desktopStyle, hiresStyle ] = stylesheets

    expect(defaultStyle).toBeInstanceOf(CSSStyleSheet)
    expect(defaultStyle.cssRules).toHaveLength(1)
    expect(defaultStyle.media).toBeUndefined()

    const [ defaultRule ] = defaultStyle.cssRules

    expect(defaultRule).toBeInstanceOf(CSSRule)
    expect(defaultRule.cssText).toEqual(":host {background-image: url(mobile.webp);}")

    expect(desktopStyle).toBeInstanceOf(CSSStyleSheet)
    expect(desktopStyle.cssRules).toHaveLength(2)
    expect(desktopStyle.media).toEqual("(min-width: 1024px)")

    const [ , desktopRule ] = desktopStyle.cssRules

    expect(desktopRule).toBeInstanceOf(CSSRule)
    expect(desktopRule.cssText).toEqual("@keyframes testAnimation { \n" +
                                        "  0% {transform: rotateZ(0deg);} \n" +
                                        "  100% {transform: rotateZ(360deg);} \n" +
                                        "}")

    expect(hiresStyle).toBeInstanceOf(CSSStyleSheet)
    expect(hiresStyle.cssRules).toHaveLength(1)
    expect(hiresStyle.media).toEqual("(min-resolution: 144dpi)")

    const [ hiresRule ] = hiresStyle.cssRules

    expect(hiresRule).toBeInstanceOf(CSSRule)
    expect(hiresRule.cssText).toEqual(":host {border-width: 1px; border-style: solid; border-color: black;}")
  })

  it("should return empty array when scaled styles are empty", () => {
    expect(constructStyleSheets({
        "2x": {},
      },
      {
        "2x": "(min-resolution: 144dpi)"
      })
    ).toHaveLength(0)
  })
})