import React, { useState, useEffect } from 'react';
import {InputField, Label, SelectField} from '@/components/Forms/FormFields';
import Modal from 'react-modal';
import { toast } from "react-toastify";
import Loader from '@/components/Loader';
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
      const [userRole, setUserRole] = useState<string>("");
      const [_id, set_id] = useState<string>("");
      const [status, setStatus] = useState<string>("");
      const [errors, setErrors] = useState<Errors>({});
      const [isFormValid, setIsFormValid] = useState<boolean>(false);
      const [selectedOption, setSelectedOption] = useState<string>("");
      const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
      const [isLoading, setIsLoading] = useState(false);
      const [formData, setFormData] = useState({
        _id: '',
        userRole: '',
        status: '',
      });

    // Validate form
    const validateForm = () => {
      let errors: Errors = {};
  
      if (!userRole) {
        errors.userRole = "User role is required.";
      }
  
      if (!status) {
        errors.status = "Status is required.";
      }
  
      setErrors(errors);
      setIsFormValid(Object.keys(errors).length === 0);
    };
    // Submit
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      validateForm();
      if (!userRole || !status) {
        toast.error("Form fields are empty or invalid.");
        return;
      }
      setIsLoading(true);
      const payload = { userRole, status, _id};
      try {
        const response = await fetch(`${apiBaseURL}/api/manageuserrole/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
    
        const data = await response.json();
    
        if (response.ok) {
          toast.success(data.message);
          setFormData({ _id:"", userRole: "", status: "" });
          fetchData(page, perPage);
          onClose();
        } else {
          toast.error(data.message || "Failed to add user role.");
        }
        setIsLoading(false);
      } catch (error) {
        toast.error("Network error. Please try again.");
        setIsLoading(false);
      }
    };
    //Custom form error styles

  // Load item details into the form when modal opens
  useEffect(() => {
    if (itemDetails) {
      set_id(itemDetails._id);
      setUserRole(itemDetails.vrole_name);
      setStatus(itemDetails.estatus);
      setFormData({
        _id: itemDetails._id || '',
        userRole: itemDetails.vrole_name || '',
        status: itemDetails.estatus || 'inactive', // Default to 'inactive'
      });
    }else {
      set_id(""); // Reset _id when no item is selected
      setStatus("active");
      setFormData({ _id:"", userRole: "", status: "" });
    }
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
      <input
                type="hidden"
                name="_id"
                value={_id}
                onChange={(e) => set_id(e.target.value)}
            />
        <div>
          <Label htmlFor="User Role" text="User Role" required/>
          <InputField
            type="text"
            name="userRole" 
            value={userRole}
            placeholder="Enter User Role"
            onChange={(e) => setUserRole(e.target.value)} // Use handleChange here
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
          value={status}
          name="status"
          onChange={(e) => setStatus(e.target.value)} // Use handleChange here
          className="relative z-20 w-full rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
          placeholder="Select Status"
        />
        {errors.status && <p className='err' style={styles.error}>{errors.status}</p>}
        </div>
        <div>
          <button  type="submit" className="float-right rounded-md bg-primary px-6 py-2 text-white hover:bg-opacity-90 xl:px-6"  disabled={isLoading}>
            Save
          </button>
          <button className="mr-3 float-right rounded-md bg-gray-400 px-6 py-2 text-white hover:bg-opacity-90 xl:px-6" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
      {isLoading && <Loader />} 
    </Modal>
  );
};

export default EditModal;
