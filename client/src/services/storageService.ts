import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Uploads photo evidence to Firebase Cloud Storage under structured folders.
 * Paths:
 * - complaints/{id}/{filename}
 * - work-orders/{id}/before/{filename}
 * - work-orders/{id}/after/{filename}
 */
export async function uploadPhotoToFirebase(
  file: File,
  folder: 'complaints' | 'work-orders',
  id: string,
  subfolder?: 'before' | 'after'
): Promise<string> {
  try {
    const timestamp = Date.now();
    const cleanFileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storagePath = subfolder
      ? `${folder}/${id}/${subfolder}/${cleanFileName}`
      : `${folder}/${id}/${cleanFileName}`;

    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error: any) {
    console.warn('Firebase Storage upload warning (falling back to DataURL/Local Object):', error);
    // Fallback in case of storage network restriction or mock environment
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
}
