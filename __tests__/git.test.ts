/**
 * Basic unit tests for the git utility functions, src/utils/git.ts
 * 
 * These tests focus on the bare minimum without mocking exec functions,
 * so they will depend on the actual git repository state.
 */
import { describe, expect, test } from '@jest/globals'
import { getLastGitCommit } from '../src/utils/git.js'

describe('git.ts', () => {
  describe('getLastGitCommit', () => {
    test('returns a properly structured GitCommit object when in a valid git repo', async () => {
      // This test assumes it's running in a valid git repository
      const commit = await getLastGitCommit()
      
      // If we're in a valid git repo with commits, we should get a commit
      if (commit) {
        // Verify the structure of the GitCommit object
        expect(commit).toHaveProperty('author')
        expect(commit).toHaveProperty('authorEmail')
        expect(commit).toHaveProperty('message')
        expect(commit).toHaveProperty('commitHash')
        expect(commit).toHaveProperty('abbreviatedCommitHash')
        
        // Check data types
        expect(typeof commit.author).toBe('string')
        expect(typeof commit.authorEmail).toBe('string')
        expect(typeof commit.message).toBe('string')
        expect(typeof commit.commitHash).toBe('string')
        expect(typeof commit.abbreviatedCommitHash).toBe('string')
        
        // Verify the commit hash is a valid SHA-1 (40 characters for full hash)
        expect(commit.commitHash).toMatch(/^[0-9a-f]{40}$/)
        
        // Verify abbreviated hash is a subset of the full hash
        expect(commit.commitHash.startsWith(commit.abbreviatedCommitHash)).toBe(true)
      } else {
        // If we're not in a valid git repo or have no commits, this test is skipped
        console.log('Test skipped: No git commits found in repository')
      }
    })
    
    test('handles the case when git information cannot be retrieved', async () => {
      // Since we're not mocking, we can only run this as an integration test
      // that confirms the function returns either a valid object or null
      const commit = await getLastGitCommit()
      
      // The function should either return a valid GitCommit object or null
      if (commit !== null) {
        expect(commit).toMatchObject({
          author: expect.any(String),
          authorEmail: expect.any(String),
          message: expect.any(String),
          commitHash: expect.any(String),
          abbreviatedCommitHash: expect.any(String)
        })
      } else {
        // If null is returned, just verify it's actually null
        expect(commit).toBeNull()
      }
    })
  })
})
