import * as core from '@actions/core'
import * as github from '@actions/github'
import { getLastGitCommit } from './utils/git.js'
import { UploadBuildOptions } from './interfaces.js'
import { uploadBuild } from './upload.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const apiKey = core.getInput('apiKey', { required: true })
    const appId = core.getInput('appId', { required: true })
    const bucketId = core.getInput('bucketId', { required: true })
    const filePath = core.getInput('filePath', { required: true })
    const testerNotes = core.getInput('testerNotes')

    const uploadOptions = await getUploadOptions(testerNotes)

    await uploadBuild(apiKey, appId, bucketId, filePath, uploadOptions)
  } catch (error) {
    // Fail the workflow run if an error occurs
    console.error(error)
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function getUploadOptions(
  testerNotes?: string
): Promise<UploadBuildOptions> {
  const context = github.context
  const buildUrl = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`
  const commitUrl = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/commit/${context.sha}`

  const commit = await getLastGitCommit()

  return {
    testerNotes: testerNotes,
    ciBuildInfo: {
      buildIdentifier: context.runNumber.toString(),
      startedAt: new Date(),
      status: 'success',
      url: buildUrl,
      commitHash: context.sha,
      commitMessage: commit?.message,
      commitAuthor: commit?.author,
      commitUrl: commitUrl,
      branch: context.ref,
      integrationId: 'github-ci',
      workflowData: {
        workflowId: context.runId.toString(),
        workflowName: context.workflow
      }
    }
  }
}
