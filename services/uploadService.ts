import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Upload một file lên Firebase Storage và trả về URL tải xuống
 * @param file File cần upload
 * @param folder Thư mục lưu trữ (mặc định là 'uploads')
 * @returns Promise<string> URL của file sau khi upload
 */
export const uploadFileToStorage = async (file: File, folder: string = 'uploads'): Promise<string> => {
  if (!file) throw new Error("No file provided");

  // Tạo tên file duy nhất bằng cách thêm timestamp
  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const storageRef = ref(storage, `${folder}/${fileName}`);

  // Tăng timeout lên 120s (2 phút) để hỗ trợ file lớn
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error("Quá thời gian tải lên (120s). Vui lòng kiểm tra kết nối mạng.")), 120000)
  );

  try {
    // 1. Upload file (Đua với timeout)
    const snapshot = await Promise.race([
      uploadBytes(storageRef, file),
      timeoutPromise
    ]);
    
    // 2. Lấy URL tải xuống
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};