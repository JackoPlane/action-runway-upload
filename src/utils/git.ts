import * as exec from '@actions/exec'
import * as core from '@actions/core'

/**
 * The git commit object
 */
export interface GitCommit {
  author: string
  authorEmail: string
  message: string
  commitHash: string
  abbreviatedCommitHash: string
}

/**
 * Get the last git commit
 * @returns The last git commit
 */
export async function getLastGitCommit(): Promise<GitCommit | null> {
  const author = await lastGitCommitFormattedWith('%an')
  const authorEmail = await lastGitCommitFormattedWith('%ae')
  const message = await lastGitCommitFormattedWith('%B')
  const commitHash = await lastGitCommitFormattedWith('%H')
  const abbreviatedCommitHash = await lastGitCommitFormattedWith('%h')

  // Check if any of the values are null
  if (
    !author ||
    !authorEmail ||
    !message ||
    !commitHash ||
    !abbreviatedCommitHash
  ) {
    return null
  }

  return {
    author,
    authorEmail,
    message,
    commitHash,
    abbreviatedCommitHash
  }
}

/**
 * Get the last git commit formatted with the given pretty format and date format
 * @see The `git-log` documentation for valid format placeholders
 * @param prettyFormat The pretty format to use
 * @param dateFormat The date format to use
 * @returns The last git commit
 */
async function lastGitCommitFormattedWith(
  prettyFormat: string,
  dateFormat?: string
): Promise<string | null> {
  const command = await exec.getExecOutput(
    'git',
    [
      'log',
      '-1',
      `--pretty=${prettyFormat}`,
      dateFormat ? `--date=${dateFormat}` : undefined
    ].filter(Boolean) as string[],
    {
      silent: !core.isDebug()
    }
  )

  if (command.exitCode !== 0) {
    core.debug(
      `Failed to get last git commit formatted with ${prettyFormat} and ${dateFormat}: ${command.stderr}`
    )

    return null
  }

  return command.stdout.trim()
}
