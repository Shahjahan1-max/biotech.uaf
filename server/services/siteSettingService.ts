import { prisma } from '../utils/prisma.js'
import { storageService } from './storage/index.js'

const SITE_SETTING_ID = 'site'
const MAX_FOUNDER_NAME_LENGTH = 100

export class SiteSettingValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SiteSettingValidationError'
  }
}

export interface FounderSettings {
  founderName: string
  founderImage: string | null
}

export interface FounderSettingsUpdate {
  founderName?: unknown
  founderImage?: unknown
}

function toFounderSettings(record: {
  founderName: string
  founderImage: string | null
}): FounderSettings {
  return {
    founderName: record.founderName,
    founderImage: record.founderImage,
  }
}

async function getOrCreateSetting() {
  return prisma.siteSetting.upsert({
    where: { id: SITE_SETTING_ID },
    update: {},
    create: { id: SITE_SETTING_ID },
  })
}

export async function getFounderSettings(): Promise<FounderSettings> {
  const setting = await getOrCreateSetting()
  return toFounderSettings(setting)
}

function normalizeFounderName(value: unknown): string {
  if (typeof value !== 'string') {
    throw new SiteSettingValidationError('Founder name must be text')
  }
  const name = value.trim()
  if (!name) {
    throw new SiteSettingValidationError('Founder name is required')
  }
  if (name.length > MAX_FOUNDER_NAME_LENGTH) {
    throw new SiteSettingValidationError(
      `Founder name must be at most ${MAX_FOUNDER_NAME_LENGTH} characters`
    )
  }
  return name
}

async function normalizeFounderImage(value: unknown): Promise<string | null> {
  if (value === null) return null

  if (typeof value !== 'string') {
    throw new SiteSettingValidationError('Invalid founder image')
  }

  const fileName = value.trim()
  if (!fileName) return null

  const file = await storageService.get(fileName)
  if (!file) {
    throw new SiteSettingValidationError('Founder image file not found')
  }
  if (!file.mimeType.startsWith('image/')) {
    throw new SiteSettingValidationError('Founder image must be an image file')
  }

  return fileName
}

export async function updateFounderSettings(
  input: FounderSettingsUpdate
): Promise<FounderSettings> {
  const data: { founderName?: string; founderImage?: string | null } = {}

  if (input.founderName !== undefined) {
    data.founderName = normalizeFounderName(input.founderName)
  }

  if (input.founderImage !== undefined) {
    data.founderImage = await normalizeFounderImage(input.founderImage)
  }

  if (Object.keys(data).length === 0) {
    throw new SiteSettingValidationError('No changes provided')
  }

  await getOrCreateSetting()
  const updated = await prisma.siteSetting.update({
    where: { id: SITE_SETTING_ID },
    data,
  })

  return toFounderSettings(updated)
}

export async function clearFounderImage(): Promise<FounderSettings> {
  await getOrCreateSetting()
  const updated = await prisma.siteSetting.update({
    where: { id: SITE_SETTING_ID },
    data: { founderImage: null },
  })

  return toFounderSettings(updated)
}
