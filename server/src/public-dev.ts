import { createServer } from 'node:http'
import { publicAnalysis } from './public-gateway.ts'
// Same adapter as production, loopback only. Vite proxies /api here.
createServer((request, response) => {
  if (request.url === '/api/analysis') void publicAnalysis(request, response)
  else { response.statusCode = 404; response.end() }
}).listen(8788, '127.0.0.1', () => console.log('Lingua public adapter: http://127.0.0.1:8788'))
