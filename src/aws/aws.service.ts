import { Injectable } from '@nestjs/common'
import * as AWS from 'aws-sdk'
import { PutObjectRequest } from 'aws-sdk/clients/s3'

@Injectable()
export class AwsService {
  private readonly s3: AWS.S3

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      signatureVersion: 'v4'
    })
  }

  async uploadFile(
    file: Express.Multer.File,
    key: string
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    const params: PutObjectRequest = {
      Bucket: 'siftdating',
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    }

    return this.s3.upload(params).promise()
  }

  async getFileUrl(key: string): Promise<string> {
    const params = {
      Bucket: 'siftdating',
      Key: key,
      Expires: 30 * 60
    }

    return this.s3.getSignedUrlPromise('getObject', params)
  }

  async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: 'siftdating',
      Key: key
    }

    await this.s3.deleteObject(params).promise()
  }
}
