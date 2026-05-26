export function toYaml(obj) {
  return serializeValue(obj, 0).trimEnd() + '\n';
}

function serializeValue(value, indent) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return serializeArray(value, indent);
  if (typeof value === 'object') return serializeObject(value, indent);
  return ' '.repeat(indent) + formatScalar(value) + '\n';
}

function serializeObject(obj, indent) {
  const pad = ' '.repeat(indent);
  let result = '';

  for (const [key, val] of Object.entries(obj)) {
    if (val === null || val === undefined) continue;

    if (Array.isArray(val)) {
      if (val.length === 0) {
        result += pad + key + ': []\n';
      } else {
        result += pad + key + ':\n' + serializeArray(val, indent + 2);
      }
      continue;
    }

    if (typeof val === 'object') {
      const nested = serializeObject(val, indent + 2);
      result += pad + key + ':';
      result += nested ? '\n' + nested : ' {}\n';
      continue;
    }

    result += pad + key + ': ' + formatScalar(val) + '\n';
  }

  return result;
}

function serializeArray(arr, indent) {
  const pad = ' '.repeat(indent);
  let result = '';

  if (arr.length === 0) return pad + '[]\n';

  for (const item of arr) {
    if (item === null || item === undefined) continue;

    if (Array.isArray(item)) {
      result += pad + '-\n' + serializeArray(item, indent + 2);
      continue;
    }

    if (typeof item === 'object') {
      const entries = Object.entries(item).filter(([, v]) => v !== null && v !== undefined);
      if (entries.length === 0) continue;

      const [firstKey, firstVal] = entries[0];
      if (isComplex(firstVal)) {
        result += pad + '- ' + firstKey + ':\n';
        result += serializeValue(firstVal, indent + 4);
      } else {
        result += pad + '- ' + firstKey + ': ' + formatScalar(firstVal) + '\n';
      }

      for (let i = 1; i < entries.length; i++) {
        const [k, v] = entries[i];
        if (isComplex(v)) {
          result += pad + '  ' + k + ':\n';
          result += serializeValue(v, indent + 4);
        } else {
          result += pad + '  ' + k + ': ' + formatScalar(v) + '\n';
        }
      }
      continue;
    }

    result += pad + '- ' + formatScalar(item) + '\n';
  }

  return result;
}

function isComplex(v) {
  return v !== null && v !== undefined && typeof v === 'object';
}

function formatScalar(value) {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null';
  if (typeof value === 'string') return needsQuotes(value) ? '"' + escapeString(value) + '"' : value;
  return 'null';
}

function needsQuotes(str) {
  if (str === '') return true;
  if (/^(true|false|null|yes|no|on|off)$/i.test(str)) return true;
  if (/^[+-]?\d+(\.\d+)?$/.test(str)) return true;
  if (/[:#{}\[\],&*?|<>=!%@`"'\\\n]/.test(str)) return true;
  if (/^\s|\s$/.test(str)) return true;
  return false;
}

function escapeString(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}
