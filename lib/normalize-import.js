module.exports = function normalizeImport (p) {
  if (typeof p === 'string') {
    return System.import(p).then(normalize)
  } else if (Array.isArray(p)) {
    return System.import(p[0]).then(plugin => normalize(plugin)(p[1]))
  } else {
    return p
  }
}

function normalize (e) {
  return typeof e === 'object' && e.default
    ? e.default
    : e
}
