import * as crypto from 'crypto'

export const validateInitData = (initData: string) => {
  const searchParams = new URLSearchParams(initData)

  searchParams.sort()

  const hash = searchParams.get('hash')
  searchParams.delete('hash')

  const dataToCheck = [...searchParams.entries()]
    .map(([key, value]) => key + '=' + value)
    .join('\n')

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(process.env.TELEGRAM_BOT_TOKEN)
    .digest()

  const _hash = crypto
    .createHmac('sha256', secretKey)
    .update(dataToCheck)
    .digest('hex')

  return hash === _hash
}
