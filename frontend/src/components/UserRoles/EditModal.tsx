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
    userModSections: {
      _id: number;
      eMenuType: string;
      vModuleName: string;
      iModAll: boolean;
      iModList: boolean;
      iModView: boolean;
      iModAdd: boolean;
      iModUpdate: boolean;
      iModDelete: boolean;
      iModExport: boolean;
    }[];
    fetchData: (page: number, perPage: number) => Promise<void>; // Add fetchData prop
    page: number;
    perPage: number;
  }
  type Errors = {
    userRole?: string;
    status?: string;
  };
  interface Permission {
    isAll?: boolean;
    isList?: boolean;
    isView?: boolean;
    isAdd?: boolean;
    isUpdate?: boolean;
    isDelete?: boolean;
    isExport?: boolean;
  }
  
  type PermissionsState = Record<number, Permission>;
  const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, itemDetails, IsisAction, fetchData, page, perPage,userModSections }) => {
    const [errors, setErrors] = useState<Errors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
      _id: '',
      userRole: '',
      status: '',
    });
    const [permissions, setPermissions] = useState({});

    // Handle checkbox change
    const handleCheckboxChange = (moduleId: number, field: keyof Permission) => 
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setPermissions((prevPermissions: PermissionsState) => ({
          ...prevPermissions,
          [moduleId]: {
            ...prevPermissions[moduleId],
            [field]: event.target.checked,
          },
        }));
      };
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
      const payload = {
        ...formData,
        permissions, // Include permissions in the request
      };
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
          setErrors(apiErrors);
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
            width: '800px',
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
          <table className="w-full table-auto" id="role_datatable">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="text-left">Select Module</th>
              <th className="text-left">Select Sub Module</th>
              <th>All</th>
              <th>List</th>
              <th>View</th>
              <th>Add</th>
              <th>Edit</th>
              <th>Delete</th>
              <th>Export</th>
            </tr>
          </thead>
          <tbody>
            {userModSections?.map((section) => (
              <tr key={section._id} className="bg-gray-2 text-left dark:bg-meta-4">
                <td className="text-left">
                  <strong>{section.eMenuType === 'Module' ? section.vModuleName : ''}</strong>
                </td>
                <td className="text-left">
                  {section.eMenuType !== 'Module' ? section.vModuleName : ''}
                </td>
                <td>
                  {section.iModAll ? (
                    <input
                      type="checkbox"
                      name={`permissions[${section._id}][isAll]`}
                      className="menu_all"
                      value="1"
                      onChange={handleCheckboxChange(section._id, 'isAll')}
                    />
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  {section.iModList ? (
                    <input
                      type="checkbox"
                      name={`permissions[${section._id}][isList]`}
                      className="allow_access"
                      value="1"
                      onChange={handleCheckboxChange(section._id, 'isList')}
                    />
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  {section.iModView ? (
                    <input
                      type="checkbox"
                      name={`permissions[${section._id}][isView]`}
                      className="allow_access"
                      value="1"
                      defaultChecked={
                        section.vModuleName === 'trackAsset Dashboard' && section.iModView
                      }
                      onChange={handleCheckboxChange(section._id, 'isView')}
                    />
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  {section.iModAdd ? (
                    <input
                      type="checkbox"
                      name={`permissions[${section._id}][isAdd]`}
                      className="allow_access"
                      value="1"
                      onChange={handleCheckboxChange(section._id, 'isAdd')}
                    />
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  {section.iModUpdate ? (
                    <input
                      type="checkbox"
                      name={`permissions[${section._id}][isUpdate]`}
                      className="allow_access"
                      value="1"
                      onChange={handleCheckboxChange(section._id, 'isUpdate')}
                    />
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  {section.iModDelete ? (
                    <input
                      type="checkbox"
                      name={`permissions[${section._id}][isDelete]`}
                      className="allow_access"
                      value="1"
                      onChange={handleCheckboxChange(section._id, 'isDelete')}
                    />
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  {section.iModExport ? (
                    <input
                      type="checkbox"
                      name={`permissions[${section._id}][isExport]`}
                      className="allow_access"
                      value="1"
                      onChange={handleCheckboxChange(section._id, 'isExport')}
                    />
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
