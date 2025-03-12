import axios, { AxiosInstance } from 'axios'
import FormData from 'form-data'
import { createReadStream, writeFileSync } from 'fs'
import { UploadInputs } from '../upload-inputs.js'
import { BuildUploadMetadata } from './build-upload-metadata.js'

/**
 * The hostname for the Runway upload API
 */
export const RUNWAY_UPLOAD_API_HOSTNAME = 'https://upload-api.runway.team'

/**
 * The Runway upload API
 */
export class RunwayUploadApi {
  /**
   * The axios instance for the upload API
   */
  private api: AxiosInstance

  public constructor(apiKey: string) {
    this.api = axios.create({
      baseURL: RUNWAY_UPLOAD_API_HOSTNAME,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      }
    })
  }

  /**
   * Upload a build to Runway
   * @param inputs - The inputs for the upload
   * @param metadata - The metadata for the upload
   * @returns The response from the upload API
   */
  public async uploadBuild(
    inputs: UploadInputs,
    metadata: BuildUploadMetadata
  ) {
    const fileName = inputs.buildPath.split('/').pop() ?? 'file'

    const formData = new FormData()
    formData.append('file', createReadStream(inputs.buildPath), fileName)
    formData.append('data', JSON.stringify(metadata))

    const response = await this.api.post(
      `/v1/app/${inputs.appId}/bucket/${inputs.bucketId}/build`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    if (response.status !== 200) {
      console.error(response.data)
    }

    writeFileSync('./artifacts/build-response.json', JSON.stringify(response.data))

    return response.data
  }

  /**
   * Upload an additional file to a build
   * @param app - The app ID
   * @param bucket - The bucket ID
   * @param build - The build ID
   * @param filePath - The path to the file to upload
   * @param fileName - The name of the file to upload
   * @returns The response from the upload API
   */
  public async uploadAdditionalFileToBuild(
    app: string,
    bucket: string,
    build: string,
    filePath: string,
    fileName?: string
  ) {
    const _fileName = fileName ?? filePath.split('/').pop() ?? 'file'

    const formData = new FormData()
    formData.append('file', createReadStream(filePath), _fileName)
    formData.append('data', JSON.stringify({ fileName: _fileName }))

    const response = await this.api.post(
      `/v1/app/${app}/bucket/${bucket}/build/${build}/additionalFiles`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    if (response.status !== 200) {
      console.error(response.data)
    }

    return response.data
  }
}
