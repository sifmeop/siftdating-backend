export const getTelegramIdFromInitData = (initData: string) => {
  const urlParams = new URLSearchParams(initData)
  const initDataUser = JSON.parse(urlParams.get('user'))

  return Number(initDataUser.id)
}
