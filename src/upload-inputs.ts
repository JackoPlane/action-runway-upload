export interface UploadInputs {
  /**
   * The API key for the Runway account
   */
  apiKey: string
  /**
   * The ID of the organization to upload the build to
   */
  orgId: string
  /**
   * The ID of the app to upload the build to
   */
  appId: string
  /**
   * The ID of the bucket to upload the build to
   */
  bucketId: string
  /**
   * The path to the build file to upload
   */
  buildPath: string
  /**
   * The notes to include with the build
   */
  testerNotes?: string
  /**
   * The additional files to upload
   */
  additionalFiles?: string
}
