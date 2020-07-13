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

export const objectHash = (obj: object): number => stringHash(JSON.stringify(obj))

export default (o: string | object): number => "string" === typeof o ? stringHash(o) : objectHash(o)