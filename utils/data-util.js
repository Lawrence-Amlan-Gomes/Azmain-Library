export function replaceMongoIdInObject(obj) {
  if (!obj) return null;
  const { _id, ...rest } = obj;
  return { id: _id ? _id.toString() : null, ...rest };
}

export function replaceMongoIdInArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(replaceMongoIdInObject);
}