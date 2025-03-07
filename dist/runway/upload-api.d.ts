import { UploadInputs } from '../upload-inputs.js';
import { BuildUploadMetadata } from './build-upload-metadata.js';
/**
 * The hostname for the Runway upload API
 */
export declare const RUNWAY_UPLOAD_API_HOSTNAME = "https://upload-api.runway.team";
/**
 * The Runway upload API
 */
export declare class RunwayUploadApi {
    /**
     * The axios instance for the upload API
     */
    private api;
    constructor(apiKey: string);
    /**
     * Upload a build to Runway
     * @param inputs - The inputs for the upload
     * @param metadata - The metadata for the upload
     * @returns The response from the upload API
     */
    uploadBuild(inputs: UploadInputs, metadata: BuildUploadMetadata): Promise<any>;
    /**
     * Upload an additional file to a build
     * @param app - The app ID
     * @param bucket - The bucket ID
     * @param build - The build ID
     * @param filePath - The path to the file to upload
     * @param fileName - The name of the file to upload
     * @returns The response from the upload API
     */
    uploadAdditionalFileToBuild(app: string, bucket: string, build: string, filePath: string, fileName?: string): Promise<any>;
}
