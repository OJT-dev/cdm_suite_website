
import { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  CopyObjectCommand,
  DeleteObjectsCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from './aws-config';

const s3Client = createS3Client();
const { bucketName, folderPrefix } = getBucketConfig();

/**
 * Upload a file to S3
 * @param buffer File buffer
 * @param fileName Original file name
 * @param contentType MIME type of the file
 * @returns S3 key (cloud_storage_path)
 */
export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${folderPrefix}uploads/${timestamp}-${sanitizedFileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return key;
}

/**
 * Get a signed URL for downloading a file
 * @param key S3 key (cloud_storage_path)
 * @param expiresIn URL expiration time in seconds (default: 1 hour)
 * @returns Signed URL
 */
export async function getFileUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Download a file from S3 as a Buffer
 * @param key S3 key (cloud_storage_path)
 * @returns File buffer
 */
export async function downloadFile(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await s3Client.send(command);
  
  // Convert stream to buffer
  const stream = response.Body as any;
  const chunks: Buffer[] = [];
  
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  
  return Buffer.concat(chunks);
}

/**
 * Delete a file from S3
 * @param key S3 key (cloud_storage_path)
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Delete multiple files from S3
 * @param keys Array of S3 keys (cloud_storage_paths)
 */
export async function deleteFiles(keys: string[]): Promise<void> {
  if (keys.length === 0) return;

  const command = new DeleteObjectsCommand({
    Bucket: bucketName,
    Delete: {
      Objects: keys.map(key => ({ Key: key })),
    },
  });

  await s3Client.send(command);
}

/**
 * Rename/move a file in S3
 * @param oldKey Current S3 key
 * @param newKey New S3 key
 */
export async function renameFile(oldKey: string, newKey: string): Promise<string> {
  // Copy to new location
  const copyCommand = new CopyObjectCommand({
    Bucket: bucketName,
    CopySource: `${bucketName}/${oldKey}`,
    Key: newKey,
  });
  await s3Client.send(copyCommand);

  // Delete old file
  await deleteFile(oldKey);

  return newKey;
}
