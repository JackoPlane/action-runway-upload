import { UploadBuildOptions } from './interfaces.js';
export declare const RUNWAY_UPLOAD_API_HOSTNAME = "https://upload-api.runway.team";
/**
 * Uploads a build to Runway
 * @param apiKey - The API key for the Runway account
 * @param appId - The ID of the app to upload the build to
 * @param bucketId - The ID of the bucket to upload the build to
 * @param filePath - The path to the build file to upload
 * @param options - The options for the upload
 */
export declare function uploadBuild(apiKey: string, appId: string, bucketId: string, filePath: string, options: UploadBuildOptions): Promise<any>;
