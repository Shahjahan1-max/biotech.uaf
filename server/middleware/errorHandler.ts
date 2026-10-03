import type { Request, Response, NextFunction } from 'express'

export function errorHandler(
  err: Error & { status?: number; statusCode?: number; type?: string; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && 'body' in err)) {
    res.status(400).json({ error: 'Invalid JSON payload' })
    return
  }

  if (err.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request body too large' })
    return
  }

  if (err.name === 'MulterError') {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large'
        : err.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'Unexpected file field'
          : 'Invalid file upload'
    res.status(status).json({ error: message })
    return
  }

  const status = err.status ?? err.statusCode
  if (typeof status === 'number' && status >= 400 && status < 500) {
    res.status(status).json({ error: 'Bad request' })
    return
  }

  console.error('Unhandled API error')
  res.status(500).json({ error: 'Internal server error' })
}
