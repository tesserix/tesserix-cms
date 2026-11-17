import { Forbidden, type Field } from 'payload'
import { canApprove } from '../access/roles'

const norm = (v: unknown) => (v === undefined || v === '' ? null : v)

/**
 * The approver's note back to the editor. Field access alone would silently drop an editor's
 * value; the hook (which runs before field access) rejects a real change instead. The admin form
 * resubmits the unchanged note on every save, so an unchanged value is allowed.
 */
export const reviewNote: Field = {
  name: 'reviewNote',
  type: 'textarea',
  admin: { position: 'sidebar', description: 'Written by approvers. Editors can read it but not change it.' },
  access: { create: ({ req }) => canApprove(req.user), update: ({ req }) => canApprove(req.user) },
  hooks: {
    beforeValidate: [
      ({ value, previousValue, req }) => {
        if (req.user && !canApprove(req.user) && norm(value) !== norm(previousValue)) throw new Forbidden(req.t)
        return value
      },
    ],
    // A copy starts without the source's review.
    beforeDuplicate: [() => null],
  },
}
