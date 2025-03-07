/**
 * The inputs for the action
 */
export enum Inputs {
  ApiKey = 'api-key',
  OrgId = 'org-id',
  AppId = 'app-id',
  BucketId = 'bucket-id',
  BuildPath = 'build-path',
  TesterNotes = 'tester-notes',
  AdditionalFiles = 'additional-files'
}

/**
 * The outputs for the action
 */
export enum Outputs {
  BuildId = 'build-id',
  InstallUrl = 'install-url',
  BuildFileSize = 'build-file-size'
}
