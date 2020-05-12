import React from "react"
import PropTypes         from "prop-types"
import { StyleConsumer } from "./index"

const GlobalStyles = ({ children }) => <StyleConsumer>{
  styleEngine => {
    document.adoptedStyleSheets = styleEngine.computeGlobalStyleSheets()

    return children
  }
}</StyleConsumer>

GlobalStyles.propTypes = {
  children: PropTypes.node,
}

export default GlobalStyles;