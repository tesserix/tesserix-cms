import type { Field } from 'payload'

/** Position on the site; the site sorts every Tesserix collection by it. */
export const orderField: Field = {
  name: 'order',
  type: 'number',
  required: true,
  admin: { position: 'sidebar', description: 'Lower comes first on the site.' },
}
