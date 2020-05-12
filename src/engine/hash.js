export const stringHash = (string) => {
  let hash = 0;

  if (!string || 0 === string.length) return hash;

  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return hash;
}

export const objectHash = (obj) => stringHash(JSON.stringify(obj))

export default (o) => "string" === typeof o ? stringHash(o) : objectHash(o)