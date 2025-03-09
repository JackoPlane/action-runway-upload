import * as core from '@actions/core'
import QRCode from 'qrcode'
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

  await printInstallDetails(
    'org_nrumYfyI',
    inputs.appId,
    uploadedBuild.id,
    inputs.bucketId
  )
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

    for (const file of searchResult.filesToUpload) {
      await api.uploadAdditionalFileToBuild(appId, bucketId, buildId, file)
    }

    return
  }
}

async function printInstallDetails(
  orgId: string,
  appId: string,
  buildId: string,
  bucketId: string
) {
  const installUrl = `https://app.runway.team/dashboard/org/${orgId}/app/${appId}/builds?buildId=${buildId}&bucketId=${bucketId}`
  const qrCode = await QRCode.toString(installUrl, {
    type: 'terminal',
    small: true
  })

  core.info('Runway Build')
  core.info('=============')
  core.info('')
  core.info('Scan the QR code above to view the build in the Runway dashboard.')
  core.info('')
  for (const line of qrCode.split('\n')) {
    core.info('\t' + line)
  }
  core.info('')
  core.info(`Direct link: ${installUrl}`)
  core.info('')
}
