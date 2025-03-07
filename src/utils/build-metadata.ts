import * as github from '@actions/github'
import { getLastGitCommit } from './git.js'
import { BuildUploadMetadata } from '../runway/build-upload-metadata.js'

/**
 * Get the build metadata
 * @param testerNotes Optional tester notes to include with the build
 * @returns The build metadata
 */
export async function getBuildMetadata(
  testerNotes?: string
): Promise<BuildUploadMetadata> {
  const context = github.context
  const buildUrl = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`
  const commitUrl = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/commit/${context.sha}`

  const commit = await getLastGitCommit()

  // If we don't have commit information, the branch name and run number, we can't create a `ciBuildInfo` object
  if (!commit || !context.ref || !context.runNumber) {
    return {
      testerNotes: testerNotes
    }
  }

  const workflowData =
    context.runId && context.workflow
      ? {
          workflowId: context.runId.toString(),
          workflowName: context.workflow
        }
      : undefined

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
      workflowData
    }
  }
}
