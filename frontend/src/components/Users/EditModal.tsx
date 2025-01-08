'use client'; // This enables client-side interactivity
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from "react-modal";
import { useRouter } from 'next/navigation'
import Image from "next/image";
import Loader from '@/components/Loader';
const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface EditModalProps {
  isOpen: boolean;
  IsisAction: string;
  onClose: () => void;
  itemDetails: { estatus: string; vfirst_name: string; vlast_name: string; vpassword: string; vprofile_image: string; vuser_name: string; vemail: string;  irole_id: string; } | null; // Details of the selected user or null
  page: number;
  perPage: number;
  fetchData: (page: number, perPage: number) => Promise<void>; 
}
const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  IsisAction,
  itemDetails,
  page,
  perPage,
  fetchData,
}) => {
  const router = useRouter()
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    user_name: "",
    email: "",
    password: "",
    user_role: "",
    status: "",
    profile_image: "",
  });
  const [errors, setErrors] = useState({
    first_name: "",
    last_name: "",
    user_name: "",
    email: "",
    password: "",
    profile_image: "",
    user_role: "",
    status: "",
    });
  const [profile_image, setFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [roles, setRoles] = useState<{ _id: string; vrole_name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
      if (itemDetails) {
        setFormData({
          first_name: itemDetails.vfirst_name || '',
          last_name: itemDetails.vlast_name || '',
          user_name: itemDetails.vuser_name || '',
          email: itemDetails.vemail || '',
          password:'', // Assuming password is available
          user_role: itemDetails.irole_id,  // Set a default user_role if necessary
          status: itemDetails.estatus || 'active',
          profile_image: itemDetails.vprofile_image || '',
        });
      }
      const fetchRoles = async () => {  
        try {
          const response = await axios.get(`${apiBaseURL}/api/user-roles/`);
          setRoles(response.data.data); // Assuming API returns { roles: [{ id, name }] }
        } catch (error) {
          console.error("Error fetching user roles:", error);
        }
      };
      fetchRoles();
    }, [itemDetails]);
  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { first_name: '', user_name: '', email: '', password: '', last_name: '', profile_image:'', user_role:'', status:'' };
    // Validate First Name
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'This field is required';
      isValid = false;
    }
    // Validate last_name
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'This field is required';
      isValid = false;
    }
    // Validate User Name
    if (!formData.user_name.trim()) {
      newErrors.user_name = 'This field is required';
      isValid = false;
    } else if (formData.user_name.length < 5) {
      newErrors.user_name = 'User name must be at least 5 characters';
      isValid = false;
    }
    // Validate Email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'This field is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }
    // Validate Password
    if(IsisAction != 'Edit User'){
      if (!formData.password.trim()) {
        newErrors.password = 'This field is required';
        isValid = false;
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
        isValid = false;
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter';
        isValid = false;
      }  else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one lowercase letter';
        isValid = false;
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one number';
        isValid = false;
      } else if (!/[@$!%*?&]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one special character';
        isValid = false;
      }
    }
    if (!formData.user_role || !formData.user_role.trim()) {
      newErrors.user_role = 'This field is required';
      isValid = false;
    }
    if (!formData.status.trim()) {
      newErrors.status = 'This field is required';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('first_name', formData.first_name);
      formDataToSubmit.append('last_name', formData.last_name);
      formDataToSubmit.append('user_name', formData.user_name);
      formDataToSubmit.append('email', formData.email);
      formDataToSubmit.append('password', formData.password);
      formDataToSubmit.append('user_role', formData.user_role);
      formDataToSubmit.append('status', formData.status);
      if (profile_image) {
          formDataToSubmit.append('profile_image', profile_image); // Append the profile image
      }
      try {
        let url;
        if (IsisAction !== 'Edit User') {
          url = `${apiBaseURL}/api/add-user/`; // Set URL for add-user
        } else {
          url = `${apiBaseURL}/api/edit-user/`; // Set URL for edit-user
        }
      await axios.post(url, formDataToSubmit, {
          headers: {
              "Content-Type": "multipart/form-data",  // Correct content type
          }
      })
      .then(response => {
        // Redirect to another page after successful sign-in
          setTimeout(() => {
          setMessage(response.data.message);
          setFormData({
            first_name: "",
            last_name: "",
            user_name: "",
            email: "",
            password: "",
            user_role: "",
            status: "",
            profile_image:"",
          });
            router.push('/users/manage-users');
            setIsLoading(false);
          }, 2000); // Delay the redirection to show the success message for 2 seconds
      })
        fetchData(page, perPage);
        onClose();
      } catch (error) {
        setIsLoading(false);
      }
    } else {
      console.log('Form has errors');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Add User"
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          padding: "20px",
          borderRadius: "8px",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.75)",
        },
      }}
    >
      <div className="modal-title">
        {IsisAction}
      </div>
      <form onSubmit={handleSubmit}>
        {/* Grid Layout with col-4 */}
        <div className="modal-body">
          <div className="grid lg:grid-cols-3 gap-4">
              <div className='col-span-2'>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name} // Placeholder for `firstName`
                      onChange={handleChange}
                      className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                    {errors.first_name && <p className='err' style={{ color: 'red' }}>{errors.first_name}</p>}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name} // Placeholder for `lastName`
                      onChange={handleChange}
                      className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                    {errors.last_name && <p className='err' style={{ color: 'red' }}>{errors.last_name}</p>}
                  </div>
                  {/* Password */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                      Username
                    </label>
                    <input
                      type="text"
                      name="user_name"
                      value={formData.user_name} // Placeholder for `password`
                      onChange={handleChange}
                      className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                    {errors.user_name && <p className='err' style={{ color: 'red' }}>{errors.user_name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email} // Placeholder for `email`
                      onChange={handleChange}
                      className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                    {errors.email && <p className='err' style={{ color: 'red' }}>{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password} // Placeholder for `password`
                      onChange={handleChange}
                      className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                    {errors.password && <p className='err' style={{ color: 'red' }}>{errors.password}</p>}
                  </div>
                  {/* Password */}
                  
                  {/* User Role */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                      User Role
                    </label>
                    <select
                      name="user_role"
                      value={formData.user_role}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    >
                      <option value="">Select User Role</option>
                      {roles.map((role) => (
                        <option key={role._id} value={role._id}>{role.vrole_name}</option>
                      ))}
                    </select>
                    {errors.user_role && <p className='err' style={{ color: 'red' }}>{errors.user_role}</p>}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    >
                      <option value="">Select Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    {errors.status && <p className='err' style={{ color: 'red' }}>{errors.status}</p>}
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-5.5">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="Username"
                  >
                    Profile
                  </label>
                  <div className="rounded-full">
                  {thumbnailUrl && ( <Image
                      src={thumbnailUrl}
                      width={55}
                      height={55}
                      className="rounded-full h-10 w-10 border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/40"
                      alt="User"
                    />  )}
                  </div>
                  {formData && formData.profile_image.length > 0 && formData.profile_image && (
                    <div>
                      <img
                        alt="Uploaded"
                        loading="lazy"
                        width="200"
                        height="200"
                        className="rounded-full h-10 w-10 border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/40"
                        src={`${apiBaseURL}/${formData.profile_image}`}
                      />
                    </div>
                  )}
                  <div
                    id="FileUpload"
                    className="relative mb-5.5 mt-2 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray px-3 py-3 dark:bg-meta-4 sm:py-7.5"
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
                    {errors.profile_image && <p className='err' style={{ color: 'red' }}>{errors.profile_image}</p>}
                  </div>
                </div>
              </div>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="modal-footer">
          <div className="mt-6 flex justify-end gap-3">
          <button
              className="rounded-md bg-gray-400 px-6 py-2 text-white hover:bg-opacity-90"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="rounded-md bg-primary px-6 py-2 text-white hover:bg-opacity-90"
              type="submit" disabled={isLoading}
            >
              Save
            </button>
            
          </div>
        </div>
      </form>
      {isLoading && <Loader />} 
    </Modal>
  );
};

export default EditModal;
