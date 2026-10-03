import type { Request, Response } from 'express'
import * as adminDashboardService from '../services/adminDashboardService.js'

export async function getDashboard(_req: Request, res: Response) {
  try {
    const dashboard = await adminDashboardService.getDashboard()
    res.json(dashboard)
  } catch {
    res.status(500).json({ error: 'Failed to load dashboard' })
  }
}
