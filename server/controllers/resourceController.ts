import type { Request, Response } from 'express'
import * as resourceService from '../services/resourceService'
import type { ResourceInput } from '../types/resource'
import { handleServiceError } from '../utils/handleServiceError'

export async function getResources(req: Request, res: Response) {
  try {
    const subjectId = req.query.subjectId as string | undefined
    const resources = await resourceService.getResources(subjectId)
    res.json({ resources })
  } catch {
    res.status(500).json({ error: 'Failed to fetch resources' })
  }
}

export async function getResource(req: Request, res: Response) {
  try {
    const resource = await resourceService.getResourceById(req.params.id)
    if (!resource) {
      res.status(404).json({ error: 'Resource not found' })
      return
    }
    res.json({ resource })
  } catch {
    res.status(500).json({ error: 'Failed to fetch resource' })
  }
}

function readInput(body: unknown): Record<string, unknown> | null {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null
  return body as Record<string, unknown>
}

export async function createResource(req: Request, res: Response) {
  try {
    const input = readInput(req.body)
    if (!input) {
      res.status(400).json({ error: 'Invalid request body' })
      return
    }
    const { title, description, resourceType, url, subjectId } = input
    const resource = await resourceService.createResource({
      title,
      description,
      resourceType,
      url,
      subjectId,
    } as ResourceInput)
    res.status(201).json({ resource })
  } catch (error) {
    handleServiceError(res, error, 'Failed to create resource')
  }
}

export async function updateResource(req: Request, res: Response) {
  try {
    const input = readInput(req.body)
    if (!input) {
      res.status(400).json({ error: 'Invalid request body' })
      return
    }
    const { title, description, resourceType, url, subjectId } = input
    const resource = await resourceService.updateResource(req.params.id, {
      title,
      description,
      resourceType,
      url,
      subjectId,
    } as ResourceInput)
    res.json({ resource })
  } catch (error) {
    handleServiceError(res, error, 'Failed to update resource')
  }
}

export async function deleteResource(req: Request, res: Response) {
  try {
    await resourceService.deleteResource(req.params.id)
    res.json({ message: 'Resource deleted successfully' })
  } catch (error) {
    handleServiceError(res, error, 'Failed to delete resource')
  }
}
