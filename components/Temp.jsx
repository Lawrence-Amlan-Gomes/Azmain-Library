"use client";
import { callChangePhoto } from "@/app/actions";
import { useAuth } from "@/app/hooks/useAuth";
import { useTheme } from "@/app/hooks/useTheme";
import { useEffect, useRef, useState } from "react";

export default function ProfilePic() {
  const { theme } = useTheme();
  const [editPic, setEditPic] = useState(false);
  const [image, setImage] = useState("");
  const [isUploading, setIsUploading] = useState(false); // 🔄 Upload state
  const { auth, setAuth } = useAuth();
  const inputRef = useRef(null);

  useEffect(() => {
    if (editPic) {
      setTimeout(() => {
        setEditPic(false);
      }, 5000);
    }
  }, [editPic]);

  const handleImageClick = () => {
    inputRef.current.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return; // No file selected

    // ✅ Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("Error: Only JPG, JPEG, and PNG files are allowed!");
      return;
    }

    setIsUploading(true); // 🔄 Show uploading message

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const imageData = reader.result;
      setImage(imageData);
      setAuth({ ...auth, photo: imageData });

      try {
        await callChangePhoto(auth.email, imageData);
        setAuth({ ...auth, photo: imageData });
        alert("Uploaded successfully!"); // ✅ Success alert
      } catch (error) {
        alert("Error: Failed to upload the image!");
      } finally {
        setIsUploading(false); // ✅ Hide uploading message
      }
    };
  };

  useEffect(() => {
    if (auth?.photo) {
      setImage(auth.photo);
    }
  }, [auth]);

  const handleImageDelete = async () => {
    if (!auth) return;
    setImage("");
    setAuth({ ...auth, photo: "" });

    try {
      await callChangePhoto(auth.email, "");
      alert("Profile picture deleted successfully!");
    } catch (error) {
      alert("Error: Failed to delete profile picture!");
    }
  };

  return (
    <div className="w-full mt-5 relative">
      <div className="w-full flex items-center justify-center relative">
        <div
          className="bg-white w-[150px] h-[150px] rounded-full overflow-hidden flex items-center justify-center relative cursor-pointer"
          onClick={() => setEditPic((prev) => !prev)}
        >
          {isUploading ? ( // 🔄 Show uploading message
            <div className="w-full h-full flex justify-center items-center text-lg font-bold text-gray-600">
              Uploading...
            </div>
          ) : image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="profilepic" className="w-full h-full object-cover" />
          ) : auth?.name ? (
            <div className="w-full h-full flex justify-center items-center text-[100px] font-bold text-black">
              {auth.name.charAt(0)}
            </div>
          ) : null}
        </div>
      </div>

      {editPic && (
        <div className="w-full relative mt-2">
          <input
            className="hidden"
            type="file"
            name="file"
            ref={inputRef}
            accept="image/jpeg, image/jpg, image/png"
            onChange={handleImageUpload}
          />
          <button
            type="button"
            className={`text-blue-700 py-2 rounded-full px-3 w-[46%] m-[2%] box-border float-left ${
              theme
                ? "bg-[#c9c9c9] hover:bg-[#bdbdbd]"
                : "bg-[#161616] hover:bg-[#202020]"
            }`}
            onClick={handleImageClick}
          >
            Upload
          </button>
          <button
            className={`text-red-700 py-2 rounded-full px-3 w-[46%] m-[2%] box-border float-left ${
              theme
                ? "bg-[#c9c9c9] hover:bg-[#bdbdbd]"
                : "bg-[#161616] hover:bg-[#202020]"
            }`}
            onClick={handleImageDelete}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
