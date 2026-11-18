import { hiddenUnlessTenant } from '../../access/roles'

/** Admin grouping for the tesserix.app marketing site's collections; hidden from users of other tenants. */
export const tesserixAdmin = { group: 'Tesserix', hidden: hiddenUnlessTenant('tesserix') }
