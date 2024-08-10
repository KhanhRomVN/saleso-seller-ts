import { imageDB } from "~/firebase/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

export const handleImageSelect = (event, setSelectedImages, setIsModalOpen) => {
  if (event.target.files && event.target.files.length > 0) {
    const filesArray = Array.from(event.target.files);
    const readerPromises = filesArray.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readerPromises).then((results) => {
      setSelectedImages(results);
      setIsModalOpen(true);
    });
  }
};

export const cropImageFile = async (croppedAreaPixels, selectedImage) => {
  if (!croppedAreaPixels || !selectedImage) return null;

  const canvas = document.createElement("canvas");
  const image = new Image();
  image.src = selectedImage;

  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    croppedAreaPixels.x * scaleX,
    croppedAreaPixels.y * scaleY,
    croppedAreaPixels.width * scaleX,
    croppedAreaPixels.height * scaleY,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
};

export const handleUploadCroppedImage = async (croppedImage) => {
  const storageRef = ref(imageDB, `images/${uuidv4()}`);

  try {
    await uploadBytes(storageRef, croppedImage);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error uploading image: ", error);
    return null;
  }
};
