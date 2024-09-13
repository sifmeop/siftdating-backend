import { AWS_REGION, BUCKET_NAME } from '../env'

export const getFileUrl = (key: string) => {
  console.log('key', key)
  return `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`
}
