import * as core from '@actions/core'
import { getInputs } from './utils/input-helper.js'
import { UploadInputs } from './upload-inputs.js'
import { findFilesToUpload } from './utils/file-search.js'
import { getBuildMetadata } from './utils/build-metadata.js'
import { RunwayUploadApi } from './runway/upload-api.js'

/**
 * Run the action
 */
export async function run(): Promise<void> {
  const inputs = getInputs()

  const runwayApi = new RunwayUploadApi(inputs.apiKey)

  const uploadedBuild = await uploadBuild(runwayApi, inputs)

  if (inputs.additionalFiles) {
    await uploadAdditionalFiles(
      runwayApi,
      inputs.appId,
      inputs.bucketId,
      uploadedBuild.id,
      inputs.additionalFiles
    )
  }
}

async function uploadBuild(api: RunwayUploadApi, inputs: UploadInputs) {
  const buildMetadata = await getBuildMetadata(inputs.testerNotes)

  return await api.uploadBuild(inputs, buildMetadata)
}

async function uploadAdditionalFiles(
  api: RunwayUploadApi,
  appId: string,
  bucketId: string,
  buildId: string,
  additionalFiles: string
) {
  const searchResult = await findFilesToUpload(additionalFiles, false)

  if (searchResult.filesToUpload.length === 0) {
    // No files were found
    core.warning(
      `No files were found with the provided path: ${additionalFiles}. No additional files will be uploaded.`
    )
  } else {
    const s = searchResult.filesToUpload.length === 1 ? '' : 's'
    core.info(
      `With the provided path, there will be ${searchResult.filesToUpload.length} file${s} uploaded`
    )
    core.debug(
      `Root additional files directory is ${searchResult.rootDirectory}`
    )

    return await Promise.all(
      searchResult.filesToUpload.map(
        async (file) =>
          await api.uploadAdditionalFileToBuild(appId, bucketId, buildId, file)
      )
    )
  }
}
