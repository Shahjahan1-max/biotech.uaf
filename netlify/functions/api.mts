import serverless from 'serverless-http'
import type { Config, Context } from '@netlify/functions'
import { createApp } from '../../server/app.js'

type ApiResult = {
  statusCode: number
  headers?: Record<string, string>
  multiValueHeaders?: Record<string, string[]>
  body?: string
  isBase64Encoded?: boolean
}

export default async function handler(request: Request, context: Context) {
  const url = new URL(request.url)
  const body = Buffer.from(await request.arrayBuffer())
  const handle = serverless(createApp(), { binary: true })
  const result = await handle({
    httpMethod: request.method,
    path: url.pathname,
    headers: Object.fromEntries(request.headers),
    multiValueQueryStringParameters: Object.fromEntries([...new Set(url.searchParams.keys())].map((key) => [key, url.searchParams.getAll(key)])),
    body: body.length ? body.toString('base64') : null,
    isBase64Encoded: true,
    requestContext: { identity: { sourceIp: context.ip } },
  }, context) as ApiResult
  const headers = new Headers(result.headers as Record<string, string>)
  for (const [name, values] of Object.entries(result.multiValueHeaders ?? {})) {
    headers.delete(name)
    for (const value of values as string[]) headers.append(name, value)
  }
  const responseBody = request.method === 'HEAD' || result.statusCode === 204 || result.statusCode === 304
    ? null
    : Buffer.from(result.body ?? '', result.isBase64Encoded ? 'base64' : 'utf8')
  return new Response(responseBody, { status: result.statusCode, headers })
}

export const config: Config = { path: ['/api', '/api/*'] }
