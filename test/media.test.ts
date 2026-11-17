import sharp from 'sharp'
import type { Payload } from 'payload'
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import type { User } from '../payload-types'
import { as, getTestPayload, mkTenant, mkUser, resetDb, rest } from './helpers'

let payload: Payload
let tA: number
let tB: number
let editorA: User
let editorB: User
let approverA: User
let jpeg1200: Buffer
let big: Buffer

const pdf = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n')
// Files land on disk and persist across runs, so names carry a random stem to avoid Payload's -1 renaming.
const img = (data: Buffer, name: string, mimetype = 'image/jpeg') => ({ data, mimetype, name: `${Math.random().toString(36).slice(2)}-${name}`, size: data.length })
const mk = (file: ReturnType<typeof img>, tenant = tA, user?: User) =>
  payload.create({ collection: 'media', data: { alt: 'x', tenant }, file, ...(user ? as(user) : {}) })

beforeAll(async () => {
  jpeg1200 = await sharp({ create: { width: 1200, height: 900, channels: 3, background: '#3377aa' } }).jpeg().toBuffer()
  // Random noise does not compress, so this stays well over 5 MB as a PNG.
  const raw = Buffer.alloc(1500 * 1500 * 3)
  for (let i = 0; i < raw.length; i++) raw[i] = (i * 2654435761) >>> 24
  big = await sharp(raw, { raw: { width: 1500, height: 1500, channels: 3 } }).png({ compressionLevel: 0 }).toBuffer()
})

beforeEach(async () => {
  await resetDb()
  payload = await getTestPayload()
  tA = await mkTenant('Hospital A', 'a')
  tB = await mkTenant('Hospital B', 'b')
  editorA = await mkUser('editor-a@test.dev', 'editor', [tA])
  approverA = await mkUser('approver-a@test.dev', 'approver', [tA])
  editorB = await mkUser('editor-b@test.dev', 'editor', [tB])
})

afterEach(() => vi.restoreAllMocks())

describe('media uploads', () => {
  test('a 1200px JPEG gets card (640w) and profile (1000w) WebP sizes', async () => {
    const doc = await mk(img(jpeg1200, 'photo.jpg'))
    expect(doc.sizes?.card?.width).toBe(640)
    expect(doc.sizes?.profile?.width).toBe(1000)
    expect(doc.sizes?.card?.mimeType).toBe('image/webp')
    expect(doc.sizes?.profile?.mimeType).toBe('image/webp')
  })

  test('alt is required', async () => {
    await expect(
      payload.create({ collection: 'media', data: { tenant: tA } as never, file: img(jpeg1200, 'p.jpg') }),
    ).rejects.toThrow(/alt/i)
  })

  test('a PDF is rejected, including one renamed to .jpg', async () => {
    vi.spyOn(payload.logger, 'error').mockImplementation(() => undefined as never) // expected "Invalid MIME type" lines
    await expect(mk(img(pdf, 'doc.pdf', 'application/pdf'))).rejects.toThrow()
    await expect(mk(img(pdf, 'doc.jpg', 'image/jpeg'))).rejects.toThrow()
  })

  test('an image over 5 MB is rejected', async () => {
    expect(big.length).toBeGreaterThan(5 * 1024 * 1024)
    await expect(mk(img(big, 'big.png', 'image/png'))).rejects.toThrow(/5 ?MB/i)
  })

  test('the object prefix is the tenant slug', async () => {
    expect((await mk(img(jpeg1200, 'a.jpg'), tA)).prefix).toBe('a')
    expect((await mk(img(jpeg1200, 'b.jpg'), tB)).prefix).toBe('b')
  })

  test('a caller cannot choose the prefix', async () => {
    const doc = await payload.create({
      collection: 'media',
      data: { alt: 'x', tenant: tA, prefix: 'b' },
      file: img(jpeg1200, 'c.jpg'),
    })
    expect(doc.prefix).toBe('a')
  })
})

describe('media access', () => {
  test('anonymous can read media docs and files (published pages need photos)', async () => {
    const doc = await mk(img(jpeg1200, 'pub.jpg'), tB)
    expect((await payload.findByID({ collection: 'media', id: doc.id, ...as(null) })).id).toBe(doc.id)
    expect((await rest(`/media/file/${doc.filename}`)).status).toBe(200)
    expect((await rest(`/media/${doc.id}`)).status).toBe(200)
  })

  test('anonymous cannot list media; signed-in users can', async () => {
    await mk(img(jpeg1200, 'list.jpg'))
    expect((await rest('/media')).status).toBe(403)
    expect((await rest('/media?where[alt][equals]=x')).status).toBe(403)
    expect((await rest('/media?where[id][exists]=true')).status).toBe(403)
    expect((await rest('/media', editorA)).status).toBe(200)
  })

  test('logged-in users stay tenant-scoped, on the API and the file endpoint', async () => {
    const docB = await mk(img(jpeg1200, 'only-b.jpg'), tB)
    const docA = await mk(img(jpeg1200, 'only-a.jpg'), tA)
    expect((await payload.find({ collection: 'media', ...as(editorA) })).docs.map((d) => d.filename)).toEqual([docA.filename])
    await expect(payload.findByID({ collection: 'media', id: docB.id, ...as(editorA) })).rejects.toThrow()
    expect((await rest(`/media/file/${docB.filename}`, editorB)).status).toBe(200)
    expect((await rest(`/media/file/${docB.filename}`, editorA)).status).not.toBe(200)
  })

  test('an editor cannot upload into another tenant', async () => {
    await expect(mk(img(jpeg1200, 'x.jpg'), tB, editorA)).rejects.toThrow()
  })
})

describe('media approval gate', () => {
  test('a URL source upload is refused (it would bypass the size check)', async () => {
    vi.spyOn(payload.logger, 'error').mockImplementation(() => undefined as never)
    const body = { alt: 'x', tenant: tA, url: 'http://127.0.0.1:1/x.jpg', filename: 'x.jpg' }
    await expect(payload.create({ collection: 'media', data: body as never })).rejects.toThrow(/URL|file/i)
    const res = await rest('/media', editorA, { method: 'POST', body })
    expect(res.status).toBeGreaterThanOrEqual(400)
    expect((await payload.count({ collection: 'media' })).totalDocs).toBe(0)
  })

  test('an editor can create but not update or delete media; an approver can', async () => {
    const doc = await mk(img(jpeg1200, 'live.jpg'), tA, editorA)
    await expect(payload.update({ collection: 'media', id: doc.id, data: { alt: 'y' }, ...as(editorA) })).rejects.toThrow(/not allowed/i)
    await expect(payload.delete({ collection: 'media', id: doc.id, ...as(editorA) })).rejects.toThrow(/not allowed/i)
    expect((await rest(`/media/${doc.id}`, editorA, { method: 'DELETE' })).status).toBe(403)
    const up = await payload.update({ collection: 'media', id: doc.id, data: { alt: 'y' }, ...as(approverA) })
    expect(up.alt).toBe('y')
    await payload.delete({ collection: 'media', id: doc.id, ...as(approverA) })
  })

  test('uploading an existing filename gets a new name and leaves the old file alone', async () => {
    const first = await mk(img(jpeg1200, 'same.jpg'), tA, editorA)
    const again = await payload.create({
      collection: 'media',
      data: { alt: 'x', tenant: tA },
      file: { data: jpeg1200, mimetype: 'image/jpeg', name: first.filename!, size: jpeg1200.length },
      ...as(editorA),
    })
    expect(again.filename).not.toBe(first.filename)
    expect((await payload.findByID({ collection: 'media', id: first.id })).filename).toBe(first.filename)
  })

  test('an approver of A cannot touch B media', async () => {
    const b = await mk(img(jpeg1200, 'b.jpg'), tB)
    await expect(payload.update({ collection: 'media', id: b.id, data: { alt: 'y' }, ...as(approverA) })).rejects.toThrow()
    await expect(payload.delete({ collection: 'media', id: b.id, ...as(approverA) })).rejects.toThrow()
  })
})
