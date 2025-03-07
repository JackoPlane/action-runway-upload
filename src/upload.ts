import axios from 'axios'
import FormData from 'form-data'
import { createReadStream } from 'fs'
import { UploadBuildOptions } from './interfaces.js'

export const RUNWAY_UPLOAD_API_HOSTNAME = 'https://upload-api.runway.team'

/**
 * Uploads a build to Runway
 * @param apiKey - The API key for the Runway account
 * @param appId - The ID of the app to upload the build to
 * @param bucketId - The ID of the bucket to upload the build to
 * @param filePath - The path to the build file to upload
 * @param options - The options for the upload
 */
export async function uploadBuild(
  apiKey: string,
  appId: string,
  bucketId: string,
  filePath: string,
  options: UploadBuildOptions
) {
  const fileName = filePath.split('/').pop() ?? 'file'

  const formData = new FormData()
  formData.append('file', createReadStream(filePath), fileName)
  formData.append('data', JSON.stringify(options))

  const runwayUploadApi = axios.create({
    baseURL: RUNWAY_UPLOAD_API_HOSTNAME,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    }
  })

  const response = await runwayUploadApi.post(
    `/v1/app/${appId}/bucket/${bucketId}/build`,
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
