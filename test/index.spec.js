import React               from "react"
import { mount, render }           from "enzyme"
import root                               from "react-shadow"
import { StyleProvider, withStyleSheets } from "../src"

describe("Style Engine Component", () => {

  it("should mount with styleSheets", () => {
    const Component = ({ ...props }) => <root.div {...props}>I am a div</root.div>
    const StyledComponent = withStyleSheets(Component, {
      style: {
        color: "blue"
      },
      styleEngineTag: "Component",
    });

    const wrapper = mount(<StyleProvider><StyledComponent /></StyleProvider>);

    const comp = wrapper.find(Component);
    expect(comp.prop("styleSheets")).toHaveLength(1);

    const div = comp.childAt(0);

    expect(div).toHaveLength(1);

    const node = div.getDOMNode();

    expect(node.shadowRoot.adoptedStyleSheets).toHaveLength(1);
    expect(node.shadowRoot.adoptedStyleSheets[0].cssRules[0].style).toEqual(expect.objectContaining({
      color: 'blue'
    }));
  })
})