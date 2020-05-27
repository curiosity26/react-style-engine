"use strict"

import constructStyleFromDefinition from "../../src/engine/constructStyleFromDefinition"

describe("constructStyleFromDefinition", () => {
  it("generates styles from basic object", () => {
    const style = constructStyleFromDefinition({
      fontSize: "12px",
      color: "blue",
    })

    expect(style).toEqual("font-size: 12px;\ncolor: blue;\n")
  })

  it("generates styles with array value", () => {
    const style = constructStyleFromDefinition({
      border: [ "1px", "solid", "blue" ],
    })

    expect(style).toEqual("border: 1px solid blue;\n")
  })

  it("generates styles with complex object", () => {
    const style = constructStyleFromDefinition({
      border: {
        width: "1px",
        style: "solid",
        color: "blue",
      },
    })

    expect(style).toEqual("border-width: 1px;\nborder-style: solid;\nborder-color: blue;\n")
  })

  it("generates styles from function value", () => {
    const style = constructStyleFromDefinition({
      border: () => "1px solid blue",
    })

    expect(style).toEqual("border: 1px solid blue;\n");
  })

  it("generates an empty style for empty definition", () => {
    const style = constructStyleFromDefinition()

    expect(style).toEqual("")
  })
})