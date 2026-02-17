const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.CONTAINER_NAME;

const uploadImageToAzure = async (imageBuffer, imageName, type, metadata) => {
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
    // Safety check
    if (!blobUrl || typeof blobUrl !== "string") {
      console.log("⚠️ Invalid blob URL, skipping delete:", blobUrl);
      return;
    }

    const decodedBlobUrl = decodeURIComponent(blobUrl);

    // Make sure container name exists in URL
    if (!decodedBlobUrl.includes(`/${containerName}/`)) {
      console.log("⚠️ URL does not contain container name:", decodedBlobUrl);
      return;
    }

    // Extract blob path safely
    const blobName = decodedBlobUrl.split(`/${containerName}/`)[1];

    if (!blobName) {
      console.log("⚠️ Could not extract blob name from:", decodedBlobUrl);
      return;
    }

    const blobServiceClient =
      BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

    const containerClient =
      blobServiceClient.getContainerClient(containerName);

    const blockBlobClient =
      containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.deleteIfExists(); // safer than delete()

    console.log(`✅ Blob deleted: ${blobName}`);

  } catch (error) {
    console.error("❌ Error deleting blob:", error.message);
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