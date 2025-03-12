/**
 * Unit tests for the action's runway upload functionality, src/runway-upload.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import { Outputs } from '../src/constants.js'

// Define interfaces for type safety in tests
interface BuildMetadata {
  version?: string
  buildNumber?: string
  notes?: string
  testerNotes?: string
}

interface UploadedBuild {
  id: string
  appId: string
  version?: string
}

interface FileSearchResult {
  filesToUpload: string[]
  rootDirectory: string
}

// Mock dependencies
const mockUploadBuild = jest.fn<(inputs: any, metadata: BuildMetadata) => Promise<UploadedBuild>>()
const mockUploadAdditionalFileToBuild = jest.fn<(app: string, bucket: string, build: string, filePath: string) => Promise<any>>()
const mockRunwayUploadApi = jest.fn().mockImplementation(() => ({
  uploadBuild: mockUploadBuild,
  uploadAdditionalFileToBuild: mockUploadAdditionalFileToBuild
}))

const mockGetInputs = jest.fn<() => any>()
const mockFindFilesToUpload = jest.fn<(path: string, isRequired: boolean) => Promise<FileSearchResult>>()
const mockFileSize = jest.fn<(path: string) => string>()
const mockGetBuildMetadata = jest.fn<(notes?: string) => Promise<BuildMetadata>>()
const mockQRCodeToString = jest.fn<(text: string, options: any) => Promise<string>>()

// Mocks should be declared before the module being tested is imported
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('qrcode', () => ({
  default: {
    toString: mockQRCodeToString
  }
}))
jest.unstable_mockModule('../src/utils/input-helper.js', () => ({
  getInputs: mockGetInputs
}))
jest.unstable_mockModule('../src/utils/file-search.js', () => ({
  findFilesToUpload: mockFindFilesToUpload,
  fileSize: mockFileSize
}))
jest.unstable_mockModule('../src/utils/build-metadata.js', () => ({
  getBuildMetadata: mockGetBuildMetadata
}))
jest.unstable_mockModule('../src/runway/upload-api.js', () => ({
  RunwayUploadApi: mockRunwayUploadApi
}))

// The module being tested should be imported dynamically
const { run } = await import('../src/runway-upload.js')

describe('runway-upload.ts', () => {
  // Sample test data
  const mockInputs = {
    apiKey: 'test-api-key',
    orgId: 'org-123',
    appId: 'app-456',
    bucketId: 'bucket-789',
    buildPath: '/path/to/build.apk',
    testerNotes: 'Test build notes'
  }

  const mockBuildMetadata = {
    version: '1.0.0',
    buildNumber: '123',
    notes: 'Test build notes'
  }

  const mockUploadedBuild = {
    id: 'build-123',
    appId: 'app-456',
    version: '1.0.0'
  }

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Set up default mock implementations
    mockGetInputs.mockReturnValue(mockInputs)
    mockFileSize.mockReturnValue('10.5 MB')
    mockGetBuildMetadata.mockResolvedValue(mockBuildMetadata as BuildMetadata)
    mockUploadBuild.mockResolvedValue(mockUploadedBuild as UploadedBuild)
    mockQRCodeToString.mockResolvedValue('QR Code Content')
  })

  it('uploads a build and sets outputs correctly', async () => {
    await run()

    // Verify RunwayUploadApi was instantiated with the API key
    expect(mockRunwayUploadApi).toHaveBeenCalledWith('test-api-key')
    
    // Verify build metadata was fetched
    expect(mockGetBuildMetadata).toHaveBeenCalledWith('Test build notes')
    
    // Verify build was uploaded
    expect(mockUploadBuild).toHaveBeenCalledWith(mockInputs, mockBuildMetadata)
    
    // Verify outputs were set correctly
    expect(core.setOutput).toHaveBeenNthCalledWith(1, Outputs.BuildId, 'build-123')
    expect(core.setOutput).toHaveBeenNthCalledWith(2, Outputs.BuildFileSize, '10.5 MB')
    
    // Verify install URL output
    expect(core.setOutput).toHaveBeenNthCalledWith(
      3, 
      Outputs.InstallUrl, 
      `https://app.runway.team/dashboard/org/org-123/app/app-456/builds?buildId=build-123&bucketId=bucket-789`
    )
    
    // Verify QR code was generated
    expect(mockQRCodeToString).toHaveBeenCalledWith(
      `https://app.runway.team/dashboard/org/org-123/app/app-456/builds?buildId=build-123&bucketId=bucket-789`,
      expect.objectContaining({
        type: 'terminal',
        small: true
      })
    )
  })

  it('uploads additional files when specified', async () => {
    // Add additional files to the inputs
    const inputsWithAdditionalFiles = {
      ...mockInputs,
      additionalFiles: '/path/to/additional/files'
    }
    mockGetInputs.mockReturnValue(inputsWithAdditionalFiles)
    
    // Mock the file search results
    mockFindFilesToUpload.mockResolvedValue({
      filesToUpload: ['/path/to/additional/files/file1.txt', '/path/to/additional/files/file2.txt'],
      rootDirectory: '/path/to/additional/files'
    } as FileSearchResult)
    
    await run()
    
    // Verify findFilesToUpload was called
    expect(mockFindFilesToUpload).toHaveBeenCalledWith('/path/to/additional/files', false)
    
    // Verify uploadAdditionalFileToBuild was called for each file
    expect(mockUploadAdditionalFileToBuild).toHaveBeenCalledTimes(2)
    expect(mockUploadAdditionalFileToBuild).toHaveBeenNthCalledWith(
      1, 
      'app-456', 
      'bucket-789', 
      'build-123', 
      '/path/to/additional/files/file1.txt'
    )
    expect(mockUploadAdditionalFileToBuild).toHaveBeenNthCalledWith(
      2, 
      'app-456', 
      'bucket-789', 
      'build-123', 
      '/path/to/additional/files/file2.txt'
    )
  })

  it('handles the case when no additional files are found', async () => {
    // Add additional files to the inputs
    const inputsWithAdditionalFiles = {
      ...mockInputs,
      additionalFiles: '/path/to/non-existent/files'
    }
    mockGetInputs.mockReturnValue(inputsWithAdditionalFiles)
    
    // Mock empty file search results
    mockFindFilesToUpload.mockResolvedValue({
      filesToUpload: [],
      rootDirectory: '/path/to/non-existent/files'
    } as FileSearchResult)
    
    await run()
    
    // Verify warning was issued
    expect(core.warning).toHaveBeenCalledWith(
      'No files were found with the provided path: /path/to/non-existent/files. No additional files will be uploaded.'
    )
    
    // Verify uploadAdditionalFileToBuild was not called
    expect(mockUploadAdditionalFileToBuild).not.toHaveBeenCalled()
  })

  it('displays install details correctly', async () => {
    await run()
    
    // Verify start/end group was called
    expect(core.startGroup).toHaveBeenCalledWith('Build Installation Details')
    expect(core.endGroup).toHaveBeenCalled()
    
    // Verify info calls
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining('Scan the QR code below'))
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining('Direct link:'))
  })
})
