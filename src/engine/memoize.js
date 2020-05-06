import hash from "./hash"

export default (fn, input = []) => {
  const cache = {}

  return (...args) => {
    const key = input.length && hash(input) || hash(args)

    if (key in cache) return cache[key]

    cache[key] = fn(...args)

    return cache[key]
  }
}