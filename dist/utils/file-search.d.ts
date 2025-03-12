export interface SearchResult {
    filesToUpload: string[];
    rootDirectory: string;
}
/**
 * Find the files to upload
 * @see https://github.com/actions/upload-artifact/blob/4cec3d8aa04e39d1a68397de0c4cd6fb9dce8ec1/src/shared/search.ts#L82
 * @param searchPath The search path
 * @param includeHiddenFiles Whether to include hidden files
 * @returns The files to upload
 */
export declare function findFilesToUpload(searchPath: string, includeHiddenFiles?: boolean): Promise<SearchResult>;
export declare function fileSize(filePath: string): Promise<number>;
