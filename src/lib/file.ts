// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { storage } from "./firebaseConfig";

// /**
//  * Uploads a file to a specified folder in Firebase Storage.
//  * @param file - The file (Blob or File) to upload.
//  * @param folderPath - The folder path in Firebase Storage.
//  * @param fileName - The name for the uploaded file.
//  * @returns The download URL of the uploaded file.
//  */
// export async function uploadFileToFirebaseFolder(
//   file: Blob | File,
//   folderPath: string,
//   fileName: string
// ): Promise<string> {
//   // console.log(
//   //   "Uploading file:",
//   //   file,
//   //   "to folder:",
//   //   folderPath,
//   //   "with name:",
//   //   fileName
//   // );
//   // return "";
//   if (!file) {
//     return "";
//   }
//   if (!file || !folderPath || !fileName) {
//     throw new Error("File, folderPath, and fileName are required parameters.");
//   }
//   if (!storage) {
//     throw new Error(
//       "Firebase storage instance is undefined. Check your firebaseConfig import."
//     );
//   }
//   try {
//     const storageRef = ref(storage, `${folderPath}/${fileName}_${Date.now()}`);
//     await uploadBytes(storageRef, file);
//     return await getDownloadURL(storageRef);
//   } catch (error) {
//     console.error("Upload error", error);
//     throw error;
//   }
//   return "";
// }

export async function uploadFileToCloudinary(
  file: Blob | File,
  folderPath: string
): Promise<string> {
  if (!file) {
    return "";
  }
  if (!file || !folderPath) {
    throw new Error("File and folderPath are required parameters.");
  }
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folderPath);
    formData.append("upload_preset", "botaye_preset");
    const CloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CloudinaryCloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await res.json();
    console.log("Cloudinary upload response", data);
    if (data.secure_url) {
      return data.secure_url;
    }
  } catch (error) {
    throw error;
  }
  return "";
}
