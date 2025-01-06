import { useEffect, useState } from "react";
import Image from "next/image";

const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL; // Assuming it's set in your .env file

// Defining the prop types explicitly
interface UserProfileImageProps {
  userImage?: string | null; // `userImage` can be a string (image URL) or null
  defaultImage: string; // `defaultImage` is always a string
}

const UserProfileImage: React.FC<UserProfileImageProps> = ({ userImage, defaultImage }) => {
  const [imagePath, setImagePath] = useState<string>(defaultImage); // Explicitly typing the state as a string
  useEffect(() => {
    // If `userImage` is provided, concatenate apiBaseURL and userImage, otherwise use defaultImage
    const storedImage = userImage ? `${userImage}` : defaultImage;
    console.log(storedImage)
    setImagePath(storedImage);
  }, [userImage, defaultImage]);

  return (
    <div>
      <Image
        width={112}
        height={112}
        src={imagePath} // Dynamically set the image path
        alt="User Image"
        style={{
          width: "auto",
          height: "auto",
        }}
      />
    </div>
  );
};

export default UserProfileImage;
