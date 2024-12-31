"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useState, useEffect } from 'react';
import { toast } from "react-toastify";
const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
type Errors = {
  userrole?: string;
  status?: string;
};
const FormElements = () => {
  const [userrole, setUserRole] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    userrole: "",
    status: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "userrole") {
      setUserRole(value);
    } else if (name === "status") {
      setStatus(value);
    }
  };
  useEffect(() => {
    validateForm();
  }, [userrole, status]);

  // Validate form
  const validateForm = () => {
    let errors: Errors = {};

    if (!userrole) {
      errors.userrole = "User role is required.";
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

  if (!userrole || !status) {
    toast.error("Form fields are empty or invalid.");
    return;
  }

  const payload = { userrole, status };
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
      setFormData({
        userrole: '',
        status: '',
      });
    } else {
      toast.error(data.message || "Failed to add user role.");
    }
  } catch (error) {
    toast.error("Network error. Please try again.");
  }
};
//Custom form error styles
const styles = {
  container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
  },
  heading: {
      fontWeight: 'bold',
      fontSize: '25px',
      color: "green",
      textAlign: "center",
  },
  subHeading: {
      fontWeight: 'bold',
      fontSize: '25px',
      textAlign: "center",

  },
  form: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
  },
  input: {
      width: '100%',
      padding: '12px',
      marginBottom: '12px',
      border: '1px solid #ccc',
      borderRadius: '10px',
      fontSize: '16px',
      transition: 'border-color 0.2s ease',
  },
  button: {
      backgroundColor: 'green',
      color: '#fff',
      fontWeight: 'bold',
      fontSize: '16px',
      padding: '12px',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      width: '40%',
      transition: 'opacity 0.2s ease',
  },
  error: {
      color: 'red',
      fontSize: '14px',
      marginBottom: '6px',
  },
};
  return (
    <>
      <Breadcrumb pageName="Add User" />
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="grid grid-cols-1 gap-9">
            <div className="flex flex-col gap-5.5 p-6.5">
              <div>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  User Role
                </label>
                <input
                  type="text"
                  name="userrole"
                  placeholder="Enter User Role"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={userrole}
                  onChange={handleChange} // Use handleChange here
                />
                {errors.userrole && <p style={styles.error}>{errors.userrole}</p>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-9">
            <div className="flex flex-col gap-5.5 p-6.5">
              <div>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Status
                </label>
                <div>
                  <select
                    value={status}
                    name="status"
                    onChange={handleChange} // Use handleChange here
                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-12 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input`}
                  >
                    <option value="" disabled>
                      Select Status
                    </option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                {errors.status && <p style={styles.error}>{errors.status}</p>}
              </div>
            </div>
          </div>
        </div>
        <input
          type="submit"
          value="Submit"
          className="mt-3 inline-flex items-center justify-center float-right rounded-md bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
        />
      </form>
    </>
  );
};

export default FormElements;
