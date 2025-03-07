/**
 * The git commit object
 */
export interface GitCommit {
    author: string;
    authorEmail: string;
    message: string;
    commitHash: string;
    abbreviatedCommitHash: string;
}
/**
 * Get the last git commit
 * @returns The last git commit
 */
export declare function getLastGitCommit(): Promise<GitCommit | null>;
