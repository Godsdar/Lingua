const language = { type: 'string', enum: ['en', 'ru', 'es', 'fr'] }
const text = { type: 'string', minLength: 1, maxLength: 500 }
export const analysisSchema = {
  type: 'object', additionalProperties: false, required: ['documentId', 'language', 'text', 'contextStart', 'selection'],
  properties: {
    documentId: { type: 'string', minLength: 1, maxLength: 100, pattern: '^[a-zA-Z0-9_-]+$' },
    language: { type: 'string', const: 'en' }, text,
    contextStart: { type: 'integer', minimum: 0, maximum: 10000000 },
    selection: { type: 'object', additionalProperties: false, required: ['start', 'end'], properties: {
      start: { type: 'integer', minimum: 0, maximum: 500 }, end: { type: 'integer', minimum: 1, maximum: 500 }
    } }
  }
}
export const translationSchema = { type: 'object', additionalProperties: false, required: ['text', 'from', 'to'], properties: { text, from: language, to: language } }
export const errorSchema = { type: 'object', required: ['requestId', 'error'], properties: {
  requestId: { type: 'string' }, error: { type: 'object', required: ['code', 'message'], properties: { code: { type: 'string' }, message: { type: 'string' } } }
} }
const layer = { type: 'object', required: ['status'], properties: {
  status: { type: 'string', enum: ['prepared', 'live', 'unavailable'] }, reason: { type: 'string' },
  provenance: { type: 'object', additionalProperties: true }, data: { type: 'object', additionalProperties: true }
} }
export const analysisResponse = { type: 'object', required: ['requestId', 'schemaVersion', 'documentId', 'contextStart', 'coordinateSystem', 'selection', 'layers'], properties: {
  requestId: { type: 'string' }, schemaVersion: { type: 'integer', const: 1 }, documentId: { type: 'string' }, contextStart: { type: 'integer' }, coordinateSystem: { type: 'string' },
  warnings: { type: 'array', items: { type: 'string' } },
  selection: { type: 'object', additionalProperties: true }, layers: { type: 'object', properties: { meaning: layer, grammar: layer, etymology: layer } }
} }
export const translationResponse = { type: 'object', required: ['requestId', 'text', 'provider'], properties: { requestId: { type: 'string' }, text: { type: 'string' }, provider: { type: 'string' } } }
export const errors = Object.fromEntries([400, 401, 408, 413, 415, 422, 429, 502, 503, 504].map(code => [code, errorSchema]))
