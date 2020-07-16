import constructStyleSheets from './constructStyleSheets'
import { ConstructableStyleSheet, Scales, StyleRules } from '../types';

export default (global: StyleRules, scales: Scales = {}): ConstructableStyleSheet[] => {
  let styleSheets = []

  for (const selector in global) {
    if (!global.hasOwnProperty(selector)) continue;

    const definition = global[ selector ]

    if (!definition) continue;

    styleSheets = [ ...styleSheets, ...constructStyleSheets(definition, scales, selector) ]
  }

  return styleSheets
}