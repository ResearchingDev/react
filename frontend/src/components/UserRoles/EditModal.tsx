import React, { useState, useEffect } from 'react';
import {InputField, Label, SelectField} from '@/components/Forms/FormFields';
import Modal from 'react-modal';
import { toast } from "react-toastify";
import Loader from '@/components/Loader';
import axios from 'axios';
const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  interface EditModalProps {
    isOpen: boolean; // For the modal's open state
    IsisAction: string;
    onClose: () => void; // Callback function to close the modal
    itemDetails: { _id: string; vrole_name: string; estatus: string } | null; // Details of the selected user or null
    fetchData: (page: number, perPage: number) => Promise<void>; // Add fetchData prop
    page: number;
    perPage: number;
  }
  type Errors = {
    userRole?: string;
    status?: string;
  };
  const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, itemDetails, IsisAction, fetchData, page, perPage }) => {
    const [errors, setErrors] = useState<Errors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
      _id: '',
      userRole: '',
      status: '',
    });
    /**Reset FormData */
    function resetFormData() {
      setFormData({ _id: "", userRole: "", status: "" });  // Reset all fields to empty strings or your defaults
    }
    /** handleChange method used to push form data into required obj */
    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };
    // Validate form
    const validateForm = () => {
      let errors: Errors = {};
      if (!formData.userRole) {
        errors.userRole = "User role is required.";
      }
      if (!formData.status) {
        errors.status = "Status is required.";
      }
      setErrors(errors);
    };
    // Submit
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      validateForm();
      if (!formData.userRole || !formData.status) {
        toast.error("Form fields are empty or invalid.");
        return;
      }
      setIsLoading(true);
      const payload = formData;
      try {
        await axios.post(`${apiBaseURL}/api/manageuserrole/`, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then(response => {
          toast.success(response.data.message);
          setFormData({ _id: "", userRole: "", status: "" }); // Clear the form data
          fetchData(page, perPage); // Refresh the data
          resetFormData()
          setIsLoading(false);
          onClose(); // Close the modal
        })
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.data?.errors) {  
          const apiErrors: Record<string, string> = {};
          (err.response.data.errors as { field: string; error: string }[]).forEach(error => {
              apiErrors[error.field] = error.error;
              console.log(error.error)
          });
          setErrors(apiErrors); // ✅ Ensure you're setting errors in setErrors, NOT setFormData
      } else {
        toast.error("Network error. Please try again.");
      }
        setIsLoading(false);
      }
    };
    //Custom form error styles
    // Load item details into the form when modal opens
    useEffect(() => {
      if (itemDetails) {
        setFormData({
          _id: itemDetails._id || '',
          userRole: itemDetails.vrole_name || '',
          status: itemDetails.estatus || 'inactive', // Default to 'inactive'
        });
      }else 
        resetFormData()
      setErrors({});
    }, [itemDetails]);
    const styles = {
        error: {
          color: 'red',
          fontSize: '14px',
          marginBottom: '6px',
      },
    }
    return (
      <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Edit User"
      style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            padding: '20px',
            borderRadius: '8px',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
          },
        }}>
        <div className="modal-title">{IsisAction}</div>
        <form onSubmit={handleSubmit} className='grid gap-y-6'>
          <input type="hidden" name="_id" value={formData._id} />
          <div>
            <Label htmlFor="User Role" text="User Role" required/>
            <InputField
              type="text"
              name="userRole" 
              value={formData.userRole}
              placeholder="Enter User Role"
              onChange={handleChange}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
              {errors.userRole && <p className='err' style={styles.error}>{errors.userRole}</p>}
          </div>
          <div>
          <Label htmlFor="status" text="Status" required />
          <SelectField
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
            value={formData.status}
            name="status"
            onChange={handleChange}
            className="relative z-20 w-full rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
            placeholder="Select Status"
          />
          {errors.status && <p className='err' style={styles.error}>{errors.status}</p>}
          </div>
          <div>
            <button  type="submit" className="float-right rounded-md bg-primary px-6 py-2 text-white hover:bg-opacity-90 xl:px-6"  disabled={isLoading}>
              Save
            </button>
            <button 
              className="mr-3 float-right rounded-md bg-gray-400 px-6 py-2 text-white hover:bg-opacity-90 xl:px-6" 
              type="button" 
              onClick={() => {
                resetFormData();
                onClose();
              }}>
              Cancel
            </button>
          </div>
        </form>
        {isLoading && <Loader />} 
      </Modal>
    );
};

export default EditModal;
