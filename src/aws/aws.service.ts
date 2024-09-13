import {
  DeleteObjectCommand,
  DeleteObjectRequest,
  PutObjectCommand,
  PutObjectRequest,
  S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Injectable } from '@nestjs/common'
import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
  BUCKET_NAME
} from '~/common/env'

@Injectable()
export class AwsService {
  private readonly s3: S3Client

  constructor() {
    this.s3 = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      }
    })
  }

  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    }

    const command = new PutObjectCommand(params)

    await this.s3.send(command)

    return key.split('/')[1]
  }

  async getFileUrl(key: string): Promise<string> {
    const params: PutObjectRequest = {
      Bucket: 'siftdating',
      Key: key
    }

    const command = new PutObjectCommand(params)

    return await getSignedUrl(this.s3, command, {
      expiresIn: Infinity
    })
  }

  async deleteFile(key: string): Promise<void> {
    const params: DeleteObjectRequest = {
      Bucket: 'siftdating',
      Key: key
    }

    const command = new DeleteObjectCommand(params)

    await this.s3.send(command)
  }
}
