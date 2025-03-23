const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.CONTAINER_NAME;

const uploadImageToAzure = async (imageBuffer, imageName,type,metadata) => {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    const blobName = `${type}/${uuidv4()}-${imageName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    console.log("Uploading image with metadata:", metadata);

    await blockBlobClient.uploadData(imageBuffer, {
      metadata: metadata,  // Ensure metadata is attached
    });
    return blockBlobClient.url;
  } catch (error) {
    console.error("Error uploading to Azure Blob Storage:", error);
    throw error;
  }
};

async function deleteImageFromAzure(blobUrl) {
  try {
    const decodedBlobUrl = decodeURIComponent(blobUrl);
    const blobName = decodedBlobUrl.split(`${containerName}/`)[1];
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
    console.log(`Blob ${blobName} deleted successfully`);
  } catch (error) {
    console.error("Error deleting blob:", error);
    throw error;
  }
}

const getBlobsFromContainer = async () => {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    let blobs = [];

    for await (const blob of containerClient.listBlobsFlat({ includeMetadata: true })) {
      blobs.push({
        name: blob.name,
        url: `https://${blobServiceClient.accountName}.blob.core.windows.net/${containerName}/${blob.name}`,
        metadata: blob.metadata || {},
      });
    }

    return blobs;
  } catch (error) {
    console.error("Error fetching blobs from Azure:", error);
    throw error;
  }
};

module.exports = { 
  uploadImageToAzure, 
  deleteImageFromAzure, 
  getBlobsFromContainer 
};