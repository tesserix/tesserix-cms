import { hiddenUnlessTenant } from '../../access/roles'

/** Admin grouping for YES Hospital collections; hidden from users of other tenants. */
export const yesHospitalAdmin = { group: 'YES Hospital', hidden: hiddenUnlessTenant('yes-hospital') }
