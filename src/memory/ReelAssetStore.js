/*
  MTI — Reel Asset Store
  ----------------------
  Browser-local IndexedDB storage for uploaded Reel files.
  Files are isolated by accountId + assetId.
*/

const DB_NAME = "mti_reel_assets_v1";
const DB_VERSION = 1;
const STORE_NAME = "assets";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "assetId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB unavailable."));
  });
}

function generateAssetId() {
  return `asset_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function saveReelVideo(file, metadata = {}) {
  if (!(file instanceof Blob)) {
    throw new Error("Invalid video file.");
  }

  const asset = {
    assetId: metadata.assetId || generateAssetId(),
    accountId: metadata.accountId || "local",
    reelId: metadata.reelId || null,
    versionId: metadata.versionId || null,
    name: metadata.name || file.name || "reel",
    mimeType: metadata.mimeType || file.type || "video/mp4",
    size: file.size,
    createdAt: metadata.createdAt || new Date().toISOString(),
    blob: file
  };

  const db = await openDB();

  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(asset);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error || new Error("Failed to save video asset."));
  });

  db.close();
  return { ...asset, blob: undefined };
}

export async function getReelVideo(assetId, accountId = "local") {
  const db = await openDB();

  const asset = await new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly")
      .objectStore(STORE_NAME)
      .get(assetId);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });

  db.close();

  if (!asset || asset.accountId !== accountId) return null;
  return asset;
}

export async function deleteReelVideo(assetId, accountId = "local") {
  const asset = await getReelVideo(assetId, accountId);
  if (!asset) return false;

  const db = await openDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(assetId);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return true;
}
