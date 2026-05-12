import { SignJWT } from 'jose'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const autocannon = require('./node_modules/autocannon/autocannon.js')

const SECRET = 'margem-super-secret-key-2026-change-in-production'
const encodedKey = new TextEncoder().encode(SECRET)

async function makeToken() {
  return new SignJWT({
    userId: 'load-test-user',
    name: 'Load Test',
    email: 'test@test.com',
    role: 'DONO',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

function run(label, url, cookie, connections = 10, duration = 10) {
  return new Promise((resolve) => {
    const instance = autocannon({
      title: label,
      url,
      connections,
      duration,
      headers: { cookie: `session=${cookie}` },
    })
    autocannon.track(instance, { renderProgressBar: true })
    instance.on('done', resolve)
  })
}

async function main() {
  const token = await makeToken()
  const BASE = 'http://localhost:3000'

  console.log('\n\x1b[1m=== TESTE DE CARGA — DO CAMPO ALIMENTOS ===\x1b[0m')
  console.log('Conexões paralelas: 10 | Duração: 10s por endpoint\n')

  const endpoints = [
    ['Dashboard (page)', `${BASE}/`],
    ['API /compras', `${BASE}/api/compras`],
    ['API /produtores', `${BASE}/api/produtores`],
    ['API /colheita', `${BASE}/api/colheita`],
    ['API /produtos', `${BASE}/api/produtos`],
    ['API /caixa', `${BASE}/api/caixa`],
  ]

  const results = []
  for (const [label, url] of endpoints) {
    console.log(`\n\x1b[36m▶ ${label}\x1b[0m`)
    const res = await run(label, url, token)
    results.push({
      endpoint: label,
      rps: Math.round(res.requests.average),
      latAvg: res.latency.average.toFixed(1),
      lat99: res.latency.p99,
      errors: res.errors,
      '2xx': res['2xx'],
      non2xx: res.non2xx,
    })
  }

  console.log('\n\x1b[1m=== RESUMO ===\x1b[0m')
  console.log(
    'Endpoint'.padEnd(28) +
    'Req/s'.padStart(8) +
    'Lat avg'.padStart(10) +
    'Lat p99'.padStart(10) +
    'Erros'.padStart(8) +
    '2xx'.padStart(8)
  )
  console.log('─'.repeat(72))
  for (const r of results) {
    const errColor = r.errors > 0 ? '\x1b[31m' : '\x1b[32m'
    console.log(
      r.endpoint.padEnd(28) +
      String(r.rps).padStart(8) +
      `${r.latAvg}ms`.padStart(10) +
      `${r.lat99}ms`.padStart(10) +
      `${errColor}${r.errors}\x1b[0m`.padStart(8 + 10) +
      String(r['2xx']).padStart(8)
    )
  }
  console.log('\n')
}

main().catch(console.error)
