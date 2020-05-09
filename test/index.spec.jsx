import React, { Component, createRef, useEffect }                                from "react"
import { mount }                                                                 from "enzyme"
import root                                                                      from "react-shadow"
import { applyGlobalStylesShadowDOM, StyleProvider, withStyle, withStyleSheets } from "../src"

describe("Style Engine Component", () => {

  it("should mount with styleSheets", () => {
    const Component = (props) => <root.div { ...props }>I am a div</root.div>
    const StyledComponent = withStyleSheets(Component, {
      style: {
        color: "blue"
      },
      styleEngineTag: "Component",
    });

    const wrapper = mount(<StyleProvider><StyledComponent/></StyleProvider>);

    const comp = wrapper.find(Component);
    expect(comp.prop("styleSheets")).toHaveLength(1);

    const div = comp.childAt(0);

    expect(div).toHaveLength(1);

    const node = div.getDOMNode();

    expect(node.shadowRoot.adoptedStyleSheets).toHaveLength(1);
    expect(node.shadowRoot.adoptedStyleSheets[ 0 ].cssRules[ 0 ].style).toEqual(expect.objectContaining({
      color: "blue"
    }));
  })

  it("should mount with default component style", () => {
    const ref = createRef()
    const Component = React.forwardRef((props, ref) => <root.div { ...props } ref={ ref }>I am a div</root.div>)
    const StyledComponent = withStyleSheets(Component, { styleEngineTag: "Component" })
    const wrapper = mount(<StyleProvider componentStyles={ {
      Component: {
        color: "blue",
      }
    } }><StyledComponent ref={ ref }/></StyleProvider>);

    const comp = wrapper.find(Component)

    expect(comp.prop("styleSheets")).toHaveLength(1)

    const div = comp.childAt(0)

    expect(div).toHaveLength(1)

    const node = div.getDOMNode()

    expect(node.shadowRoot.adoptedStyleSheets).toHaveLength(1)
    expect(node.shadowRoot.adoptedStyleSheets[ 0 ].cssRules[ 0 ].style).toEqual(expect.objectContaining({
      color: "blue"
    }))
  })

  it("should mount with default component style and override", () => {
    const ref = createRef()
    const Component = React.forwardRef((props, ref) => <root.div { ...props } ref={ ref }>I am a div</root.div>)
    const StyledComponent = withStyleSheets(Component, { styleEngineTag: "Component" })
    const wrapper = mount(<StyleProvider componentStyles={ {
      Component: {
        color: "blue",
        fontSize: "12px",
      }
    } }><StyledComponent ref={ ref } style={ {
      color: "red",
    } }/></StyleProvider>);

    const comp = wrapper.find(Component)

    expect(comp.prop("styleSheets")).toHaveLength(2)

    const div = comp.childAt(0)

    expect(div).toHaveLength(1)

    const node = div.getDOMNode()

    expect(node.shadowRoot.adoptedStyleSheets).toHaveLength(2)
    const [ { cssRules: [ defaultRule ] }, { cssRules: [ rule ] } ] = node.shadowRoot.adoptedStyleSheets

    expect(defaultRule.cssText).toEqual(":host {color: blue; font-size: 12px;}")
    expect(rule.cssText).toEqual(":host {color: red;}")
  })

  it("should throw error when shadow DOM isn't supported", () => {
    const App = () => {
      applyGlobalStylesShadowDOM()

      return "Test Application"
    }

    expect(() => mount(<StyleProvider globalStyles={ {
      body: {
        fontSize: "12px",
      }
    } }>
      <App/>
    </StyleProvider>)).toThrowError("Global styles cannot by bound to a target which does not support Shadow DOM")
  })

  it("should mount global styles to document shadow DOM", () => {
    document.adoptedStyleSheets = []

    const App = () => {
      applyGlobalStylesShadowDOM()

      return "Test Application"
    }

    mount(<StyleProvider globalStyles={ {
      body: {
        fontSize: "12px",
      }
    } }>
      <App/>
    </StyleProvider>)

    expect(document.adoptedStyleSheets).toHaveLength(1)

    const [ stylesheet ] = document.adoptedStyleSheets

    expect(stylesheet).toBeInstanceOf(CSSStyleSheet)
    expect(stylesheet.cssRules).toHaveLength(1)

    const [ rule ] = stylesheet.cssRules

    expect(rule).toBeInstanceOf(CSSRule)
    expect(rule.cssText).toEqual("body {font-size: 12px;}")
  })

  it("should mount with style component", () => {
    const Component = ({ style }) => <div style={ style }>Test</div>
    const StyledComponent = withStyle(Component, {
      styleEngineTag: "Component"
    })

    const wrapper = mount(<StyleProvider componentStyles={ {
      Component: {
        fontSize: "12px",
      }
    } }>
      <StyledComponent/>
    </StyleProvider>)

    const comp = wrapper.find(Component)

    expect(comp.prop("style")).toEqual({
      fontSize: "12px",
    })
  })
})