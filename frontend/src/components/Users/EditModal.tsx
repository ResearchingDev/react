import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

  interface EditModalProps {
    isOpen: boolean; // For the modal's open state
    onClose: () => void; // Callback function to close the modal
    itemDetails: { userRole: string; status: string } | null; // Details of the selected user or null
    onSave: (updatedItem: { userRole: string; status: string }) => void; // Callback function to save changes
  }
  const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, itemDetails, onSave }) => {
  const [formData, setFormData] = useState({
    userRole: '',
    status: '',
  });

  // Load item details into the form when modal opens
  useEffect(() => {
    if (itemDetails) {
      setFormData({
        userRole: itemDetails.userRole || '',
        status: itemDetails.status || 'inactive', // Default to 'inactive'
      });
    }
  }, [itemDetails]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

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
      <h2 className="mb-9 text-2xl font-bold text-black text-center dark:text-white sm:text-title-xl2">Edit User</h2>
      <form>
        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">User Role:</label>
          <input
            type="text"
            name="userRole"
            value={formData.userRole}
            onChange={handleChange}
            placeholder="Enter user role"
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">Status:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"  
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <button className="mt-3 mr-3 inline-flex items-center justify-center float-right rounded-md bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10" type="button" onClick={handleSave}>
            Save
          </button>
          <button className="mt-3 mr-3 inline-flex items-center justify-center float-right rounded-md bg-danger px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditModal;
