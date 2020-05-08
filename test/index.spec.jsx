import React, { createRef }               from "react"
import { mount }                          from "enzyme"
import root                               from "react-shadow"
import { StyleProvider, withStyleSheets } from "../src"

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
})