import * as core from '@actions/core'
import QRCode from 'qrcode'
import { getInputs } from './utils/input-helper.js'
import { UploadInputs } from './upload-inputs.js'
import { findFilesToUpload, fileSize } from './utils/file-search.js'
import { getBuildMetadata } from './utils/build-metadata.js'
import { RunwayUploadApi } from './runway/upload-api.js'
import { Outputs } from './constants.js'

/**
 * Run the action
 */
export async function run(): Promise<void> {
  const inputs = getInputs()

  const runwayApi = new RunwayUploadApi(inputs.apiKey)

  const uploadedBuild = await uploadBuild(runwayApi, inputs)
  
  // Set build related outputs
  core.setOutput(Outputs.BuildId, uploadedBuild.id)
  core.setOutput(Outputs.BuildFileSize, fileSize(inputs.buildPath))

  // Create an install URL for this build
  const installUrl = getInstallUrl(
    inputs.orgId,
    inputs.appId,
    uploadedBuild.id,
    inputs.bucketId
  )

  // Set install URL output
  core.setOutput(Outputs.InstallUrl, installUrl)

  if (inputs.additionalFiles) {
    await uploadAdditionalFiles(
      runwayApi,
      inputs.appId,
      inputs.bucketId,
      uploadedBuild.id,
      inputs.additionalFiles
    )
  }

  // Display install details
  await printInstallDetails(installUrl)
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

    return
  } else {
    if (core.isDebug()) {
      const s = searchResult.filesToUpload.length === 1 ? '' : 's'
      core.info(
        `With the provided path, there will be ${searchResult.filesToUpload.length} file${s} uploaded`
      )
      core.debug(
        `Root additional files directory is ${searchResult.rootDirectory}`
      )
    }

    for (const file of searchResult.filesToUpload) {
      await api.uploadAdditionalFileToBuild(appId, bucketId, buildId, file)
    }

    return
  }
}

/**
 * Get the install URL for the build
 * @param orgId The ID of the organization
 * @param appId The ID of the app
 * @param buildId The ID of the build
 * @param bucketId The ID of the bucket
 * @returns The install URL for the build
 */
function getInstallUrl(
  orgId: string,
  appId: string,
  buildId: string,
  bucketId: string
): string {
  return `https://app.runway.team/dashboard/org/${orgId}/app/${appId}/builds?buildId=${buildId}&bucketId=${bucketId}`
}

async function printInstallDetails(installUrl: string) {
  const qrCode = await QRCode.toString(installUrl, {
    type: 'terminal',
    small: true
  })

  core.startGroup('Build Installation Details')
  core.info('')
  core.info('Scan the QR code below to view the build in the Runway dashboard.')
  core.info('')
  for (const line of qrCode.split('\n')) {
    core.info('\t' + line)
  }
  core.info('')
  core.info(`Direct link: ${installUrl}`)
  core.info('')
  core.endGroup()
}
