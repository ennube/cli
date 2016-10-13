export interface ListBucketsResult {
    [bucketName: string]: {
        creationDate: Date;
        ownerId: string;
        ownerName: string;
    };
}
export declare function listBuckets(): Promise<ListBucketsResult>;
export interface SyncBucketParams {
    sourceDirectory: string;
    defaultRegion: string;
    bucketName: string;
    destinationDirectory: string;
    createBucket: boolean;
}
export declare function syncBucket(params: SyncBucketParams): Promise<{}>;
