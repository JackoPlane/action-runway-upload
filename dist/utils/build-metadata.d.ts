import { BuildUploadMetadata } from '../runway/build-upload-metadata.js';
/**
 * Get the build metadata
 * @param testerNotes Optional tester notes to include with the build
 * @returns The build metadata
 */
export declare function getBuildMetadata(testerNotes?: string): Promise<BuildUploadMetadata>;
