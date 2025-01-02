import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from "react-toastify";
const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  interface EditModalProps {
    isOpen: boolean; // For the modal's open state
    IsisAction: string;
    onClose: () => void; // Callback function to close the modal
    itemDetails: { userRole: string; status: string } | null; // Details of the selected user or null
    onSave: (updatedItem: { userRole: string; status: string }) => void; // Callback function to save changes
    fetchData: (page: number, perPage: number) => Promise<void>; // Add fetchData prop
    page: number;
    perPage: number;
  }
  type Errors = {
    userRole?: string;
    status?: string;
  };
  const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, itemDetails, onSave, IsisAction, fetchData, page, perPage }) => {
      const [userRole, setUserRole] = useState<string>("");
      const [status, setStatus] = useState<string>("");
      const [errors, setErrors] = useState<Errors>({});
      const [isFormValid, setIsFormValid] = useState<boolean>(false);
      const [selectedOption, setSelectedOption] = useState<string>("");
      const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
      const [formData, setFormData] = useState({
        userRole: '',
        status: '',
      });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "userrole") {
          setUserRole(value);
        } else if (name === "status") {
          setStatus(value);
        }
      };
    //   useEffect(() => {
    //     validateForm();
    //   }, [userRole, status]);
    
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
    
      const payload = { userRole, status };
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
          setFormData({ userRole: "", status: "" });
          fetchData(page, perPage);
          onClose();
        } else {
          toast.error(data.message || "Failed to add user role.");
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
      }
    };
    //Custom form error styles

  // Load item details into the form when modal opens
  useEffect(() => {
    if (itemDetails) {
        console.log(itemDetails.userRole)
      setFormData({
        userRole: itemDetails.userRole || '',
        status: itemDetails.status || 'inactive', // Default to 'inactive'
      });
    }
  }, [itemDetails]);

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
        <div>
          <label className="mb-3 block text-black dark:text-white">User Role:</label>
          <input
                type="text"
                name="userRole"
                placeholder="Enter User Role"
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={userRole}
                onChange={handleChange} // Use handleChange here
            />
            {errors.userRole && <p style={styles.error}>{errors.userRole}</p>}
        </div>
        <div>
          <label className="mb-3 block text-black dark:text-white">Status:</label>
          <select
                value={status}
                name="status"
                onChange={handleChange} // Use handleChange here
                className={`relative z-20 w-full rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input`}
                >
                <option value="" disabled>
                    Select Status
                </option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
            {errors.status && <p style={styles.error}>{errors.status}</p>}
        </div>
        <div>
          <button  type="submit" className="float-right rounded-md bg-primary py-3 text-white hover:bg-opacity-90 xl:px-6">
            Save
          </button>
          <button className="mr-3 float-right rounded-md bg-danger py-3 text-white hover:bg-opacity-90 xl:px-6" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditModal;
