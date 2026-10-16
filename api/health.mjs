export default function health(_request, response) {
  response.setHeader('Content-Type', 'application/json')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify({ status: 'ok', analysis: 'spacy-en_core_web_sm', translation: false, persistence: false }))
}
