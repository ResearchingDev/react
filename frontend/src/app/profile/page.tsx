"use client"; 
import React, { useState, useEffect  } from "react";
import {InputField, Label} from '@/components/Forms/FormFields';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useRouter } from 'next/navigation'
import { fetchUserProfile } from '../../api/user';
import Loader from '@/components/Loader';
import axios from 'axios';
const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
const Profile = () => {
  const router = useRouter();
  const id = sessionStorage.getItem('userId') || '';
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
 const [isLoading, setIsLoading] = useState(false);
 const [message, setMessage] = useState("");
  //Set FormData
  const [formData, setFormData] = useState({
    vuser_name: "",
    vfirst_name: "",
    vemail: "",
    phoneNumber: "",
    file: "",
  });
  //Set Form Errors
  const [errors, setErrors] = useState({
    username: "",
    firstName: "",
    email: "",
    phoneNumber: "",
    file: "",
  });
  //Fetch User details
  useEffect(() => {
    if (!id) {
      sessionStorage.clear();
      router.push('/');
      return;
    }

    const getUserProfile = async () => {
      try {
        const data = await fetchUserProfile();
        // Handle phone number: set an empty string if it's null or undefined
        const number = (data.vphone_number && data.vphone_number !== 'null') ? data.vphone_number : "";
        if(data.profile_picture) setThumbnailUrl(`${apiBaseURL}/${data.profile_picture}`)
        // Ensure the form data is set correctly, including phone number
        setFormData({
          vuser_name: data.vuser_name || "",
          vfirst_name: data.vfirst_name || "",
          vemail: data.vemail || "",
          phoneNumber: number, // Set the phone number properly here
          file: data.profile_picture || "",
        });
    
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getUserProfile();
  }, [id, router]);

  //Form Validation
  const validate = () => {
    let valid = true;
    const newErrors = { username: "", firstName: "", email: "", phoneNumber: "", file: ""}

    if (!formData.vfirst_name.trim()) {
      newErrors.firstName = "First name is required";
      valid = false;
    }

    if (!formData.vemail.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.vemail)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }
    if ((formData.phoneNumber) && !/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
      valid = false;
    }
    if (formData.file){
       if(valid) valid = true;
    }else{
      if (file && !["image/jpeg", "image/png"].includes(file.type)) {
        newErrors.file = "Only JPEG or PNG images are allowed";
        valid = false;
      } else if (file && file.size > 2 * 1024 * 1024) {
        newErrors.file = "Image size must be less than 2MB";
        valid = false;
      }
    }
    setErrors(newErrors);
    return valid;
  };
    
  /** handleChange method used to push form data into required obj */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Updating field: ${name}, New value: ${value}`);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  //File Onchange action
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
      const fileUrl = URL.createObjectURL(selectedFile);
      setThumbnailUrl(fileUrl);
    }
  };

  //Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      setError(null);
      const payload = new FormData();
      payload.append('id', id);
      payload.append('username', formData.vuser_name);
      payload.append('email', formData.vemail);
      payload.append('first_name', formData.vfirst_name);
      payload.append('phone_number', formData.phoneNumber);
      if (file) {
        payload.append('file', file);
      }
      try {
        const response = await axios.post(`${apiBaseURL}/api/updateprofile/`, payload);
        const result = response.data;
        console.log(result)
        setMessage(result.message);
        sessionStorage.setItem('userName', formData.vfirst_name);
        if (result.user_image_path) sessionStorage.setItem('userImage', result.user_image_path);
        setTimeout(() => {
          setMessage('');
        }, 1000);
        setIsLoading(false);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.data?.errors) {  
            const apiErrors: Record<string, string> = {};
            (err.response.data.errors as { field: string; error: string }[]).forEach(error => {
                apiErrors[error.field] = error.error;
                console.log(error.error)
            });
            setErrors(apiErrors); // ✅ Ensure you're setting errors in setErrors, NOT setFormData
        } 
        setIsLoading(false);
      }
    };
    }
  const styles = {
      error: {
        color: 'red',
        fontSize: '14px',
        marginBottom: '6px',
    },
  }
  return (
    <DefaultLayout>
      <div className="mx-auto max-w-242.5">
        <Breadcrumb pageName="Profile" />
        <div className="grid grid-cols-5 gap-8">
        {message && <div className="bg-green-100 text-green-700 border border-green-400 px-4 py-2 rounded-md">{message}</div>}
          <div className="col-span-5">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="p-7">
                <form onSubmit={handleSubmit}>
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <Label htmlFor="fullName" text="Full Name" required/>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                        <InputField
                          type="text"
                          name="vfirst_name" 
                          value={formData.vfirst_name}
                          placeholder="Enter first name"
                          onChange={handleChange}
                          className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        />
                        {errors.firstName && <p className='err' style={styles.error}>{errors.firstName}</p>}
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <Label htmlFor="phoneNumber" text="Phone Number"/>
                      <InputField
                          type="text"
                          name="phoneNumber" 
                          value={formData.phoneNumber}
                          placeholder="Enter phone number"
                          onChange={handleChange}
                          className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        />
                      {errors.phoneNumber && <p className='err' style={styles.error}>{errors.phoneNumber}</p>}
                    </div>
                  </div>
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <Label htmlFor="emailAddress" text="Email Address" required/>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.33301 4.16667C2.87658 4.16667 2.49967 4.54357 2.49967 5V15C2.49967 15.4564 2.87658 15.8333 3.33301 15.8333H16.6663C17.1228 15.8333 17.4997 15.4564 17.4997 15V5C17.4997 4.54357 17.1228 4.16667 16.6663 4.16667H3.33301ZM0.833008 5C0.833008 3.6231 1.9561 2.5 3.33301 2.5H16.6663C18.0432 2.5 19.1663 3.6231 19.1663 5V15C19.1663 16.3769 18.0432 17.5 16.6663 17.5H3.33301C1.9561 17.5 0.833008 16.3769 0.833008 15V5Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M0.983719 4.52215C1.24765 4.1451 1.76726 4.05341 2.1443 4.31734L9.99975 9.81615L17.8552 4.31734C18.2322 4.05341 18.7518 4.1451 19.0158 4.52215C19.2797 4.89919 19.188 5.4188 18.811 5.68272L10.4776 11.5161C10.1907 11.7169 9.80879 11.7169 9.52186 11.5161L1.18853 5.68272C0.811486 5.4188 0.719791 4.89919 0.983719 4.52215Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                        <InputField
                          type="email"
                          name="vemail" 
                          value={formData.vemail}
                          placeholder="Enter email address"
                          onChange={handleChange}
                          className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"                       
                        />
                        {errors.email && <p className='err' style={styles.error}>{errors.email}</p>}
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <Label htmlFor="Username" text="Username" required/>
                      <InputField
                          type="text"
                          name="vuser_name" 
                          value={formData.vuser_name}
                          placeholder="Enter username"
                          onChange={handleChange}
                          className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        />
                      {errors.username && <p className='err' style={styles.error}>{errors.username}</p>}
                    </div>
                  </div>
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    
                    <div className="w-full sm:w-1/2">
                      <Label htmlFor="Profile Image" text="Profile Image"/>
                      <div
                        id="FileUpload"
                        className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray px-4 py-4 dark:bg-meta-4 sm:py-7.5"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                        />
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M1.99967 9.33337C2.36786 9.33337 2.66634 9.63185 2.66634 10V12.6667C2.66634 12.8435 2.73658 13.0131 2.8616 13.1381C2.98663 13.2631 3.1562 13.3334 3.33301 13.3334H12.6663C12.8431 13.3334 13.0127 13.2631 13.1377 13.1381C13.2628 13.0131 13.333 12.8435 13.333 12.6667V10C13.333 9.63185 13.6315 9.33337 13.9997 9.33337C14.3679 9.33337 14.6663 9.63185 14.6663 10V12.6667C14.6663 13.1971 14.4556 13.7058 14.0806 14.0809C13.7055 14.456 13.1968 14.6667 12.6663 14.6667H3.33301C2.80257 14.6667 2.29387 14.456 1.91879 14.0809C1.54372 13.7058 1.33301 13.1971 1.33301 12.6667V10C1.33301 9.63185 1.63148 9.33337 1.99967 9.33337Z"
                                fill="#3C50E0"
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M7.5286 1.52864C7.78894 1.26829 8.21106 1.26829 8.4714 1.52864L11.8047 4.86197C12.0651 5.12232 12.0651 5.54443 11.8047 5.80478C11.5444 6.06513 11.1223 6.06513 10.8619 5.80478L8 2.94285L5.13807 5.80478C4.87772 6.06513 4.45561 6.06513 4.19526 5.80478C3.93491 5.54443 3.93491 5.12232 4.19526 4.86197L7.5286 1.52864Z"
                                fill="#3C50E0"
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M7.99967 1.33337C8.36786 1.33337 8.66634 1.63185 8.66634 2.00004V10C8.66634 10.3682 8.36786 10.6667 7.99967 10.6667C7.63148 10.6667 7.33301 10.3682 7.33301 10V2.00004C7.33301 1.63185 7.63148 1.33337 7.99967 1.33337Z"
                                fill="#3C50E0"
                              />
                            </svg>
                          </span>
                          <p>
                            <span className="text-primary">Click to upload</span> or
                            drag and drop
                          </p>
                          <p className="mt-1.5">SVG, PNG, JPG or GIF</p>
                          <p>(max, 800 X 800px)</p>
                        </div>
                        {errors.file && <p className='err' style={styles.error}>{errors.file}</p>}
                      </div>
                    </div>
                    {thumbnailUrl && ( <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="Username"
                        >
                          Uploaded Image
                        </label>
                        <div>
                          <img
                            alt="Uploaded"
                            loading="lazy"
                            width="200"
                            height="200"
                            src={thumbnailUrl}
                          />
                        </div>
                    </div> )}
                  </div> 
                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                      type="submit" disabled={isLoading}
                    >
                      Save
                    </button>
                  </div>
                </form>
                {isLoading && <Loader />} 
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Profile;


