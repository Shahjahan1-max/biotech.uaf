import type { Request, Response } from 'express'
import * as siteSettingService from '../services/siteSettingService.js'
import { handleServiceError } from '../utils/handleServiceError.js'

function readInput(body: unknown): Record<string, unknown> | null {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null
  return body as Record<string, unknown>
}

export async function getFounder(req: Request, res: Response) {
  try {
    const founder = await siteSettingService.getFounderSettings()
    res.json(founder)
  } catch (error) {
    handleServiceError(res, error, 'Failed to load founder settings')
  }
}

export async function updateFounder(req: Request, res: Response) {
  try {
    const input = readInput(req.body)
    if (!input) {
      res.status(400).json({ error: 'Invalid request body' })
      return
    }
    const founder = await siteSettingService.updateFounderSettings({
      founderName: input.founderName,
      founderImage: input.founderImage,
    })
    res.json(founder)
  } catch (error) {
    handleServiceError(res, error, 'Failed to update founder settings')
  }
}

export async function removeFounderImage(req: Request, res: Response) {
  try {
    const founder = await siteSettingService.clearFounderImage()
    res.json(founder)
  } catch (error) {
    handleServiceError(res, error, 'Failed to remove founder image')
  }
}
