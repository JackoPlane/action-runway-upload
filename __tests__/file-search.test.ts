// /**
//  * Unit tests for the file search functionality, src/utils/file-search.ts
//  */
// import { jest } from '@jest/globals'

// // Define types for our mocks to fix TypeScript errors
// type MockFn = ReturnType<typeof jest.fn>
// type StatMock = { isDirectory: MockFn; size: number }
// type FsMock = { promises: { stat: MockFn } }
// type GlobberMock = { glob: MockFn; getSearchPaths: MockFn; globGenerator: MockFn }
// type CoreMock = { debug: MockFn; info: MockFn; warning: MockFn; error: MockFn }
// type GlobMock = { create: MockFn }
// type PathMock = { sep: string; join: MockFn; normalize: MockFn; dirname: MockFn }

// // Create mock objects before mocking modules
// const mockStat = {
//   isDirectory: jest.fn().mockReturnValue(false),
//   size: 1024
// } as StatMock

// const mockGlobber = {
//   glob: jest.fn(),
//   getSearchPaths: jest.fn(),
//   globGenerator: jest.fn(function* () { yield* [] })
// } as GlobberMock

// const mockFs = {
//   promises: {
//     stat: jest.fn().mockResolvedValue(mockStat)
//   }
// } as FsMock

// const mockCore = {
//   debug: jest.fn(),
//   info: jest.fn(),
//   warning: jest.fn(),
//   error: jest.fn()
// } as CoreMock

// const mockGlob = {
//   create: jest.fn().mockResolvedValue(mockGlobber)
// } as GlobMock

// const mockPath = {
//   sep: '/',
//   join: jest.fn((...args: string[]) => args.join('/')),
//   normalize: jest.fn((p: string) => p),
//   dirname: jest.fn((p: string) => p.substring(0, p.lastIndexOf('/')))
// } as PathMock

// // Set up mocks
// jest.unstable_mockModule('fs', () => (mockFs as unknown as typeof import('fs')))
// jest.unstable_mockModule('@actions/glob', () => (mockGlob as unknown as typeof import('@actions/glob')))
// jest.unstable_mockModule('@actions/core', () => (mockCore as unknown as typeof import('@actions/core')))
// jest.unstable_mockModule('path', () => (mockPath as unknown as typeof import('path')))

// // Variable to hold the module under test after import
// interface FileSearch {
//   findFilesToUpload: (searchPath: string, includeHiddenFiles?: boolean) => Promise<{
//     filesToUpload: string[],
//     rootDirectory: string
//   }>
//   fileSize: (filePath: string) => Promise<number>
// }

// let fileSearch: FileSearch

// beforeAll(async () => {
//   // Import the module under test after setting up mocks
//   fileSearch = await import('../src/utils/file-search')
// })

// describe('file-search', () => {
//   beforeEach(() => {
//     jest.clearAllMocks()
    
//     // Reset mock states
//     mockStat.isDirectory.mockReturnValue(false)
//     mockStat.size = 1024
//   })

//   describe('findFilesToUpload', () => {
//     it('should find files with default options', async () => {
//       // Setup
//       const searchPath = 'test/*.txt'
//       const mockFiles = [
//         'test/file1.txt',
//         'test/file2.txt'
//       ]
//       mockGlobber.glob.mockResolvedValue(mockFiles)
//       mockGlobber.getSearchPaths.mockReturnValue(['test'])

//       // Act
//       const result = await fileSearch.findFilesToUpload(searchPath)

//       // Assert
//       expect(mockGlob.create).toHaveBeenCalledWith(searchPath, {
//         followSymbolicLinks: true,
//         implicitDescendants: true,
//         omitBrokenSymbolicLinks: true,
//         excludeHiddenFiles: true
//       })
//       expect(mockGlobber.glob).toHaveBeenCalled()
//       expect(mockGlobber.getSearchPaths).toHaveBeenCalled()
//       expect(result).toEqual({
//         filesToUpload: mockFiles,
//         rootDirectory: 'test'
//       })
//     })

//     it('should include hidden files when specified', async () => {
//       // Setup
//       const searchPath = 'test/*.txt'
//       const mockFiles = [
//         'test/.hidden.txt',
//         'test/visible.txt'
//       ]
//       mockGlobber.glob.mockResolvedValue(mockFiles)
//       mockGlobber.getSearchPaths.mockReturnValue(['test'])

//       // Act
//       const result = await fileSearch.findFilesToUpload(searchPath, true)

//       // Assert
//       expect(mockGlob.create).toHaveBeenCalledWith(searchPath, {
//         followSymbolicLinks: true,
//         implicitDescendants: true,
//         omitBrokenSymbolicLinks: true,
//         excludeHiddenFiles: false
//       })
//       expect(result.filesToUpload).toEqual(mockFiles)
//     })

//     it('should filter out directories', async () => {
//       // Setup
//       const searchPath = 'test/**'
//       const mockFiles = [
//         'test/file1.txt',
//         'test/dir'
//       ]
//       mockGlobber.glob.mockResolvedValue(mockFiles)
//       mockGlobber.getSearchPaths.mockReturnValue(['test'])

//       // Setup directory check to return true for the directory path
//       mockFs.promises.stat.mockImplementation((filePath: string) => {
//         if (filePath === 'test/dir') {
//           mockStat.isDirectory.mockReturnValue(true)
//         } else {
//           mockStat.isDirectory.mockReturnValue(false)
//         }
//         return Promise.resolve(mockStat)
//       })

//       // Act
//       const result = await fileSearch.findFilesToUpload(searchPath)

//       // Assert
//       expect(result).toEqual({
//         filesToUpload: ['test/file1.txt'],
//         rootDirectory: 'test'
//       })
//     })

//     it('should handle case-insensitive file overwrites', async () => {
//       // Setup
//       const searchPath = 'test/*.txt'
//       const mockFiles = [
//         'test/file.txt',
//         'test/FILE.txt'
//       ]
//       mockGlobber.glob.mockResolvedValue(mockFiles)
//       mockGlobber.getSearchPaths.mockReturnValue(['test'])

//       // Act
//       const result = await fileSearch.findFilesToUpload(searchPath)

//       // Assert
//       expect(mockCore.info).toHaveBeenCalledWith(
//         expect.stringContaining('case insensitive')
//       )
//       expect(result.filesToUpload).toHaveLength(2)
//     })

//     it('should find least common ancestor for multiple search paths', async () => {
//       // Setup
//       const searchPath = 'test/**/*'
//       mockGlobber.glob.mockResolvedValue(['test/dir1/file1.txt', 'test/dir2/file2.txt'])
//       mockGlobber.getSearchPaths.mockReturnValue(['test/dir1', 'test/dir2'])

//       // Act
//       const result = await fileSearch.findFilesToUpload(searchPath)

//       // Assert
//       expect(mockCore.info).toHaveBeenCalledWith(
//         expect.stringContaining('Multiple search paths')
//       )
//       expect(result.rootDirectory).toBe('test')
//     })

//     it('should handle single file uploads', async () => {
//       // Setup
//       const singleFile = 'test/single.txt'
//       mockGlobber.glob.mockResolvedValue([singleFile])
//       mockGlobber.getSearchPaths.mockReturnValue([singleFile])

//       // Act
//       const result = await fileSearch.findFilesToUpload(singleFile)

//       // Assert
//       expect(result).toEqual({
//         filesToUpload: [singleFile],
//         rootDirectory: 'test'
//       })
//     })
//   })

//   describe('fileSize', () => {
//     it('should return the file size', async () => {
//       // Setup
//       mockStat.size = 12345

//       // Act
//       const size = await fileSearch.fileSize('test/file.txt')

//       // Assert
//       expect(size).toBe(12345)
//     })

//     it('should handle errors when getting file size', async () => {
//       // Setup
//       const testError = new Error('File not found')
//       mockFs.promises.stat.mockRejectedValueOnce(testError)

//       // Act and Assert
//       await expect(fileSearch.fileSize('nonexistent.txt')).rejects.toThrow()
//     })
//   })
// })
