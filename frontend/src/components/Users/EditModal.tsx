'use client'; // This enables client-side interactivity
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from "react-modal";
import { useRouter } from 'next/navigation'
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
      }
    }
    if (!formData.user_role.trim()) {
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
          setMessage(response.data.message);
          setFormData({
            first_name: "",
            last_name: "",
            user_name: "",
            email: "",
            password: "",
            user_role: "",
            status: "",
          });
        // Redirect to another page after successful sign-in
          setTimeout(() => {
            router.push('/users/manage-users');
          }, 2000); // Delay the redirection to show the success message for 2 seconds
      })
        fetchData(page, perPage);
        onClose();
      } catch (error) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              Email
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
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Profile Image
            </label>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            {errors.profile_image && <p className='err' style={{ color: 'red' }}>{errors.profile_image}</p>}
          </div>
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
        {/* Buttons */}
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
            type="submit"
          >
            Save
          </button>
          
        </div>
      </form>
    </Modal>
  );
};

export default EditModal;
