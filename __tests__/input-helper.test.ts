/**
 * Unit tests for the input helper functionality, src/utils/input-helper.ts
 */
import { jest } from '@jest/globals'
import { Inputs } from '../src/constants.js'

// Define interface for mocked core module to ensure type safety
interface MockCore {
  getInput: jest.Mock;
  setSecret: jest.Mock;
}

// Create mock for @actions/core
const mockCore: MockCore = {
  getInput: jest.fn(),
  setSecret: jest.fn()
}

// Mock the core module
jest.unstable_mockModule('@actions/core', () => mockCore)

// Import the module being tested
const { getInputs } = await import('../src/utils/input-helper.js')

describe('input-helper.ts', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks()
    
    // Set up default mock responses
    mockCore.getInput.mockImplementation((name) => {
      const inputName = String(name);
      const mockInputs: Record<string, string> = {
        [Inputs.ApiKey]: 'test-api-key',
        [Inputs.OrgId]: 'test-org-id',
        [Inputs.AppId]: 'test-app-id',
        [Inputs.BucketId]: 'test-bucket-id',
        [Inputs.BuildPath]: 'test-build-path',
        [Inputs.TesterNotes]: 'test-tester-notes',
        [Inputs.AdditionalFiles]: 'file1.txt,file2.txt'
      }
      
      return mockInputs[inputName] || ''
    })
  })

  it('gets all inputs correctly', () => {
    // Act
    const inputs = getInputs()
    
    // Assert
    expect(inputs.apiKey).toBe('test-api-key')
    expect(inputs.orgId).toBe('test-org-id')
    expect(inputs.appId).toBe('test-app-id')
    expect(inputs.bucketId).toBe('test-bucket-id')
    expect(inputs.buildPath).toBe('test-build-path')
    expect(inputs.testerNotes).toBe('test-tester-notes')
    expect(inputs.additionalFiles).toBe('file1.txt,file2.txt')
    
    // Verify core.getInput was called with the correct parameters
    expect(mockCore.getInput).toHaveBeenCalledWith(Inputs.ApiKey, { required: true })
    expect(mockCore.getInput).toHaveBeenCalledWith(Inputs.OrgId, { required: true })
    expect(mockCore.getInput).toHaveBeenCalledWith(Inputs.AppId, { required: true })
    expect(mockCore.getInput).toHaveBeenCalledWith(Inputs.BucketId, { required: true })
    expect(mockCore.getInput).toHaveBeenCalledWith(Inputs.BuildPath, { required: true })
    expect(mockCore.getInput).toHaveBeenCalledWith(Inputs.TesterNotes)
    expect(mockCore.getInput).toHaveBeenCalledWith(Inputs.AdditionalFiles)
    
    // Verify the API key is marked as a secret
    expect(mockCore.setSecret).toHaveBeenCalledWith('test-api-key')
  })

  it('handles missing optional inputs', () => {
    // Arrange
    mockCore.getInput.mockImplementation((name) => {
      const inputName = String(name);
      const mockInputs: Record<string, string> = {
        [Inputs.ApiKey]: 'test-api-key',
        [Inputs.OrgId]: 'test-org-id',
        [Inputs.AppId]: 'test-app-id',
        [Inputs.BucketId]: 'test-bucket-id',
        [Inputs.BuildPath]: 'test-build-path'
        // No tester notes or additional files
      }
      
      return mockInputs[inputName] || ''
    })
    
    // Act
    const inputs = getInputs()
    
    // Assert
    expect(inputs.apiKey).toBe('test-api-key')
    expect(inputs.orgId).toBe('test-org-id')
    expect(inputs.appId).toBe('test-app-id')
    expect(inputs.bucketId).toBe('test-bucket-id')
    expect(inputs.buildPath).toBe('test-build-path')
    expect(inputs.testerNotes).toBe('')
    expect(inputs.additionalFiles).toBe('')
  })
})
