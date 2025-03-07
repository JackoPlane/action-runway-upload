/**
 * Options for uploading a build
 */
export interface UploadBuildOptions {
    /**
     * Optional tester notes to include with the build being uploaded
     */
    testerNotes?: string;
    /**
     * Optional timestamp that will be used for creation timestamp instead of current time.
     */
    uploadedAt?: Date;
    /**
     * The CI build information for the build being uploaded
     */
    ciBuildInfo?: CIBuildInfo;
}
/**
 * CI build information for the build being uploaded
 */
export interface CIBuildInfo {
    /**
     * The identifier of the build as set by the integration provider
     */
    buildIdentifier: string;
    /**
     * The start date and time of the build
     */
    startedAt: Date;
    /**
     * The end date and time of the build
     */
    finishedAt?: Date;
    /**
     * The status of the CI build
     */
    status: 'inProgress' | 'stopped' | 'success' | 'failure' | 'skipped';
    /**
     * Your CI provider's url for the build
     */
    url?: string;
    /**
     * The commit hash of that triggered the build
     */
    commitHash: string;
    /**
     * The commit message associated with the commit hash that triggered the build
     */
    commitMessage?: string;
    /**
     * The author of the commit that triggered the build
     */
    commitAuthor?: string;
    /**
     * The url for the commit that triggered the build
     */
    commitUrl?: string;
    /**
     * The branch the build was triggered off of
     */
    branch: string;
    /**
     * ID of possible CI integration
     */
    integrationId: 'appcenter-ci' | 'apple-ci' | 'azure-ci' | 'bitrise' | 'buildkite' | 'circleci' | 'codemagic' | 'generic-ci' | 'github-ci' | 'gitlab-ci' | 'jenkins' | 'travis';
    /**
     * The workflow data associated with the build
     */
    workflowData?: WorkflowData;
}
/**
 * Workflow data associated with the build
 */
export interface WorkflowData {
    /**
     * The ID of the workflow associated with the build
     */
    workflowId: string;
    /**
     * The name of the workflow associated with the build
     */
    workflowName: string;
}
