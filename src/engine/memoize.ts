import hash from './hash'

export default <T = unknown>(fn: (...args: unknown[]) => T, input: unknown[] = []): (...args: unknown[]) => T => {
  const cache: Record<number, T> = {}

  return (...args: unknown[]) => {
    const key = input.length && hash(input) || hash(args)

    if (key in cache) return cache[key]

    cache[key] = fn(...args)

    return cache[key]
  }
}