export const stringHash = (stringToHash: string): number => {
  let hash = 0;

  if (!stringToHash || 0 === stringToHash.length) return hash;

  for (let i = 0; i < stringToHash.length; i++) {
    const char = stringToHash.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return hash;
}

export const objectHash = (obj: Record<string, unknown> | unknown[]): number => stringHash(JSON.stringify(obj))

export default (o: string | number | Record<string, unknown> | unknown[]): number => 'string' === typeof o || 'number' === typeof o ? stringHash(`${o}`) : objectHash(o)