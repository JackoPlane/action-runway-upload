import * as core from '@actions/core'
import { Inputs } from '../constants.js'
import { UploadInputs } from '../upload-inputs.js'

/**
 * Get all the inputs for the action
 * @returns The inputs for the action
 */
export function getInputs(): UploadInputs {
  const apiKey = core.getInput(Inputs.ApiKey, { required: true })
  const orgId = core.getInput(Inputs.OrgId, { required: true })
  const appId = core.getInput(Inputs.AppId, { required: true })
  const bucketId = core.getInput(Inputs.BucketId, { required: true })
  const buildPath = core.getInput(Inputs.BuildPath, { required: true })
  const testerNotes = core.getInput(Inputs.TesterNotes)
  const additionalFiles = core.getInput(Inputs.AdditionalFiles)

  // Mark `api-key` as a secret
  core.setSecret(apiKey)

  const inputs = {
    apiKey,
    orgId,
    appId,
    bucketId,
    buildPath,
    testerNotes,
    additionalFiles
  } as UploadInputs

  return inputs
}
