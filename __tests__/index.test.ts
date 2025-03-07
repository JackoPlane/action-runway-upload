/**
 * Unit tests for the action's entrypoint, src/index.ts
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

// Define a proper type for the mock function
const mockRun = jest.fn<() => Promise<void>>()

// Mock the run function from runway-upload.js
jest.unstable_mockModule('../src/runway-upload.js', () => ({
  run: mockRun
}))

// Mock @actions/core
jest.unstable_mockModule('@actions/core', () => core)

describe('index.ts', () => {
  // Reset module registry before each test to ensure a clean import
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    jest.resetModules()
  })

  it('calls run function successfully', async () => {
    // Set up the mock to resolve successfully
    mockRun.mockResolvedValue(undefined)

    // Dynamic import of the module under test
    await import('../src/index.js')

    // Verify run was called
    expect(mockRun).toHaveBeenCalledTimes(1)

    // Verify setFailed was not called (no errors)
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('sets failed status when run throws an error', async () => {
    // Set up the mock to throw an error
    const testError = new Error('Test error message')
    mockRun.mockRejectedValue(testError)

    // Dynamic import of the module
    await import('../src/index.js')

    // Verify run was called
    expect(mockRun).toHaveBeenCalledTimes(1)

    // Verify setFailed was called with the error message
    expect(core.setFailed).toHaveBeenCalledWith('Test error message')
  })
})
