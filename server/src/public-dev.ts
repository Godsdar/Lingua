import { createServer } from 'node:http'
import { publicAnalysis, publicLexicon, publicEtymology } from './public-gateway.ts'
// Same adapter as production, loopback only. Vite proxies /api here.
createServer((request, response) => {
  if (request.url === '/api/analysis') void publicAnalysis(request, response)
  else if (request.url === '/api/lexicon') void publicLexicon(request, response)
  else if (request.url === '/api/etymology') void publicEtymology(request, response)
  else { response.statusCode = 404; response.end() }
}).listen(8788, '127.0.0.1', () => console.log('Lingua public adapter: http://127.0.0.1:8788'))
