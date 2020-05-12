import React             from "react"
import { mount }         from "enzyme"
import { StyleProvider } from "../src"
import GlobalStyles      from "../src/GlobalStyles"

describe("Global Styles", () => {
  it("should mount", () => {
    // JSDom doesn't really have Shadow DOM (at least not on the document object)
    document.adoptedStyleSheets = [];

    const wrapper = mount(<StyleProvider globalStyles={ { body: { color: "blue" } } }>
      <GlobalStyles>
        <div>I'm mounted baby!</div>
      </GlobalStyles>
    </StyleProvider>)

    expect(wrapper).toHaveLength(1);
    expect(wrapper.find('div')).toHaveLength(1)
    expect(wrapper.find('div').text()).toEqual("I'm mounted baby!")

    expect(document.adoptedStyleSheets).toHaveLength(1)

    const [ styleSheet ] = document.adoptedStyleSheets
    expect(styleSheet).toBeInstanceOf(CSSStyleSheet)
    expect(styleSheet.cssRules).toHaveLength(1)

    const [ rule ] = styleSheet.cssRules
    expect(rule.cssText).toEqual("body {color: blue;}")
  })
})