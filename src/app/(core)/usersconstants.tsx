import { useTranslation } from '@/utils/i18n';
// eslint-disable-next-line react-hooks/rules-of-hooks
const { t } = useTranslation();
const tableItems =
{
  username: t('tableItem.username'),
  name: t('tableItem.name'),
  email: t('tableItem.email'),
  number: t('tableItem.number'),
  team: t('tableItem.team'),
  role: t('tableItem.role'),
  actions: t('tableItem.actions'),
  administrator: t('tableItem.administrator'),
  normalusers: t('tableItem.normalusers'),

}

const commonItems = {
  delete: t('common.delete'),
  search: t('common.search'),
  add: t('common.add'),
  cancel: t('common.cancel'),
  confirm: t('common.confirm'),
  edit: t('common.edit'),
  modifyrole: t('common.modifyrole'),
  modifydelete: t('common.modifydelete'),
  addNew: t('common.addNew')

}
export { tableItems, commonItems };