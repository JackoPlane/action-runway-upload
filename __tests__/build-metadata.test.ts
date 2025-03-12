/**
 * Unit tests for the build metadata functionality, src/utils/build-metadata.ts
 */
import { jest } from '@jest/globals'

// Import the GitCommit interface for proper typing
import { GitCommit } from '../src/utils/git.js'

// Mock the GitHub context
const mockGitHubContext = {
  serverUrl: 'https://github.com',
  repo: {
    owner: 'test-owner',
    repo: 'test-repo'
  },
  runId: 12345,
  runNumber: 42,
  ref: 'refs/heads/main',
  sha: 'abcdef1234567890abcdef1234567890abcdef12',
  workflow: 'Test Workflow'
}

// Mock the last git commit with the correct interface structure
const mockLastGitCommit: GitCommit = {
  author: 'Test Author',
  authorEmail: 'test@example.com',
  message: 'Test commit message',
  commitHash: 'abcdef1234567890abcdef1234567890abcdef12',
  abbreviatedCommitHash: 'abcdef'
}

// Type for the mocked getLastGitCommit function
type GetLastGitCommitType = () => Promise<GitCommit | null>

// Create mocks for dependencies
jest.unstable_mockModule('@actions/github', () => ({
  context: mockGitHubContext
}))

jest.unstable_mockModule('../src/utils/git.js', () => ({
  getLastGitCommit: jest
    .fn<GetLastGitCommitType>()
    .mockResolvedValue(mockLastGitCommit)
}))

// Import the mocked git helper so we can manipulate it in tests
const gitModule = await import('../src/utils/git.js')
const getLastGitCommit =
  gitModule.getLastGitCommit as jest.MockedFunction<GetLastGitCommitType>

// Import the module being tested
const { getBuildMetadata } = await import('../src/utils/build-metadata.js')

describe('build-metadata.ts', () => {
  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks()
  })

  it('returns complete metadata when all GitHub context is available', async () => {
    const testerNotes = 'Test notes for testers'
    const metadata = await getBuildMetadata(testerNotes)

    // Verify tester notes are passed through
    expect(metadata.testerNotes).toBe(testerNotes)

    // Verify CI build info is present and correctly populated
    expect(metadata.ciBuildInfo).toBeDefined()

    if (metadata.ciBuildInfo) {
      // Verify build identifier from GitHub context
      expect(metadata.ciBuildInfo.buildIdentifier).toBe('42')

      // Verify dates
      expect(metadata.ciBuildInfo.startedAt).toBeInstanceOf(Date)

      // Verify status
      expect(metadata.ciBuildInfo.status).toBe('success')

      // Verify URL construction
      expect(metadata.ciBuildInfo.url).toBe(
        'https://github.com/test-owner/test-repo/actions/runs/12345'
      )

      // Verify commit info
      expect(metadata.ciBuildInfo.commitHash).toBe(
        'abcdef1234567890abcdef1234567890abcdef12'
      )
      expect(metadata.ciBuildInfo.commitMessage).toBe('Test commit message')
      expect(metadata.ciBuildInfo.commitAuthor).toBe('Test Author')
      expect(metadata.ciBuildInfo.commitUrl).toBe(
        'https://github.com/test-owner/test-repo/commit/abcdef1234567890abcdef1234567890abcdef12'
      )

      // Verify branch
      expect(metadata.ciBuildInfo.branch).toBe('refs/heads/main')

      // Verify integration ID
      expect(metadata.ciBuildInfo.integrationId).toBe('github-ci')

      // Verify workflow data
      expect(metadata.ciBuildInfo.workflowData).toBeDefined()
      if (metadata.ciBuildInfo.workflowData) {
        expect(metadata.ciBuildInfo.workflowData.workflowId).toBe('12345')
        expect(metadata.ciBuildInfo.workflowData.workflowName).toBe(
          'Test Workflow'
        )
      }
    }
  })

  it('includes only tester notes when git commit info is not available', async () => {
    // Mock getLastGitCommit to return null
    getLastGitCommit.mockResolvedValueOnce(null)

    const testerNotes = 'Notes only mode'
    const metadata = await getBuildMetadata(testerNotes)

    // Should only have tester notes
    expect(metadata.testerNotes).toBe(testerNotes)

    // CI build info should be undefined
    expect(metadata.ciBuildInfo).toBeUndefined()
  })

  it('works without tester notes', async () => {
    const metadata = await getBuildMetadata()

    // Tester notes should be undefined
    expect(metadata.testerNotes).toBeUndefined()

    // CI build info should still be present
    expect(metadata.ciBuildInfo).toBeDefined()
  })

  it('handles missing GitHub context information gracefully', async () => {
    // Create a simplified mock of the getLastGitCommit function that returns null
    // which will satisfy the first condition in the if statement in getBuildMetadata
    getLastGitCommit.mockResolvedValueOnce(null)

    // Test with a custom tester note
    const testerNotes = 'Context missing'
    const metadata = await getBuildMetadata(testerNotes)

    // Should only have tester notes when commit info is null
    expect(metadata.testerNotes).toBe(testerNotes)
    expect(metadata.ciBuildInfo).toBeUndefined()
  })
})
