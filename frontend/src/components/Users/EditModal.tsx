'use client'; // This enables client-side interactivity
import React, { useState, useEffect } from 'react';
import {InputField, Label, SelectField} from '@/components/Forms/FormFields';
import axios from 'axios';
import Modal from "react-modal";
import { useRouter } from 'next/navigation'
import Loader from '@/components/Loader';
const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface EditModalProps {
  isOpen: boolean;
  IsisAction: string;
  onClose: () => void;
  itemDetails: { estatus: string; vfirst_name: string; vlast_name: string; vpassword: string; vphone_number: number; vprofile_image: string; vuser_name: string; vemail: string;  irole_id: string; } | null; // Details of the selected user or null
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
    phone_number: "",
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
    phone_number: "",
    profile_image: "",
    user_role: "",
    status: "",
    });
  // Define the options type explicitly for SelectField
  interface SelectOption {
    value: string;
    label: string;
  }
  const [profile_image, setFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [roles, setRoles] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    setThumbnailUrl("");
    if (!isOpen) {
      // Reset errors when modal is closed
      setErrors({
        first_name: "",
        last_name: "",
        user_name: "",
        email: "",
        password: "",
        phone_number: "",
        profile_image: "",
        user_role: "",
        status: "",
      });
    }
  }, [isOpen]);
  /**Reset FormData */
  function resetFormData() {
    setFormData({
      first_name: "",
      last_name: "",
      user_name: "",
      email: "",
      password: "",
      phone_number: "",
      user_role: "",
      status: "",
      profile_image:"",
    });
  }
  useEffect(() => {
      if (itemDetails) {
        setFormData({
          first_name: itemDetails.vfirst_name || '',
          last_name: itemDetails.vlast_name || '',
          user_name: itemDetails.vuser_name || '',
          email: itemDetails.vemail || '',
          password:'', // Assuming password is available
          phone_number: itemDetails.vphone_number || '',
          user_role: itemDetails.irole_id,  // Set a default user_role if necessary
          status: itemDetails.estatus || 'active',
          profile_image: itemDetails.vprofile_image || '',
        });
        if(itemDetails.vprofile_image) setThumbnailUrl(`${apiBaseURL}/${itemDetails.vprofile_image}`)
      }
      const fetchRoles = async () => {  
        try {
          const response = await axios.get(`${apiBaseURL}/api/user-roles/`);
          const roles = response.data.data.map((role:any) => ({
            value: role._id,
            label: role.vrole_name,
          }));
          setRoles(roles); // Assuming API returns { roles: [{ id, name }] }
        } catch (error) {
          console.error("Error fetching user roles:", error);
        }
      };
      fetchRoles();
    }, [itemDetails]);
  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { first_name: '', user_name: '', email: '', password: '', phone_number: '', last_name: '', profile_image:'', user_role:'', status:'' };
    // Validate First Name
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'This field is required';
      isValid = false;
    }
    // Validate User Name
    if (!formData.user_name.trim()) {
      newErrors.user_name = 'This field is required';
      isValid = false;
    } else if (formData.user_name.length < 5) {
      newErrors.user_name = 'User name must be at least 5 characters';
      isValid = false;
    }else if (/\s/.test(formData.user_name)) {  // Check for spaces
      newErrors.user_name = 'User name cannot contain spaces';
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
    if ((formData.phone_number) && !/^\d{10}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Phone number must be 10 digits";
      isValid = false;
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
      formDataToSubmit.append('phone_number', formData.phone_number);
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
            if (IsisAction !== 'Edit User') {
              resetFormData();
            }
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
                    <Label htmlFor="First Name" text="First Name" required/>
                    <InputField
                      type="text"
                      name="first_name" 
                      value={formData.first_name}
                      placeholder="Enter First Name"
                      onChange={handleChange}
                      className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                    {errors.first_name && <p className='err' style={{ color: 'red' }}>{errors.first_name}</p>}
                  </div>

                  {/* Last Name */}
                  <div>
                    <Label htmlFor="Last Name" text="Last Name"/>
                    <InputField
                      type="text"
                      name="last_name" 
                      value={formData.last_name}
                      placeholder="Enter Last Name"
                      onChange={handleChange}
                      className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                    {errors.last_name && <p className='err' style={{ color: 'red' }}>{errors.last_name}</p>}
                  </div>
                  {/* Password */}
                  <div>
                    <Label htmlFor="Username" text="Username" required/>
                    <InputField
                      type="text"
                      name="user_name" 
                      value={formData.user_name}
                      placeholder="Enter User Name"
                      onChange={handleChange}
                      className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                    {errors.user_name && <p className='err' style={{ color: 'red' }}>{errors.user_name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="Email Address" text="Email Address" required/>
                    <InputField
                      type="email"
                      name="email" 
                      value={formData.email}
                      placeholder="Enter Email Address"
                      onChange={handleChange}
                      className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                    {errors.email && <p className='err' style={{ color: 'red' }}>{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <Label htmlFor="Password" text="Password" required/>
                    <InputField
                      type="password"
                      name="password" 
                      value={formData.password}
                      placeholder="Enter Password"
                      onChange={handleChange}
                      className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                    {errors.password && <p className='err' style={{ color: 'red' }}>{errors.password}</p>}
                  </div>
                  {/* Password */}
                  
                  {/* Phone Number */}
                  <div>
                    <Label htmlFor="Phone Number" text="Phone Number"/>
                    <InputField
                      type="text"
                      name="phone_number" 
                      value={formData.phone_number}
                      placeholder="Enter phone number"
                      onChange={handleChange}
                      className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                    {errors.phone_number && <p className='err' style={{ color: 'red' }}>{errors.phone_number}</p>}
                  </div>
                  {/* Phone Number */}
                  {/* User Role */}
                  <div>
                    <Label htmlFor="User Role" text="User Role" required/>
                    <SelectField
                      options={roles}
                      value={formData.user_role}
                      name="user_role"
                      onChange={handleChange}
                      className="relative z-20 w-full rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                      placeholder="Select Status"
                    />
                    {errors.user_role && <p className='err' style={{ color: 'red' }}>{errors.user_role}</p>}
                  </div>

                  {/* Status */}
                  <div>
                    <Label htmlFor="Status" text="Status"/>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    >
                      <option value="">Select Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    {errors.status && <p className='err' style={{ color: 'red' }}>{errors.status}</p>}
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-5.5">
                  <Label htmlFor="Profile Image" text="Profile Image"/>
                  {thumbnailUrl && (
                    <div>
                      <img
                        alt="Uploaded"
                        loading="lazy"
                        width="200"
                        height="200"
                        className="rounded-full h-10 w-10 border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/40"
                        src={thumbnailUrl}
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
              onClick={()=>{
                resetFormData();
                onClose()
              }}
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
