'use client'
import React from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa'; // For icons
import EditModal from './EditModal';

const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
const DataTableComponent: React.FC = () => {
  const [data, setData] = useState<any[]>([]); // Adjust `any[]` to your data structure type if known
  const [totalRows, setTotalRows] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAction, setIsisAction] = useState<string>('Add User');
  const fetchData = async (page: number, perPage: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseURL}/api/user-list/`, {
        params: { page, per_page: perPage },
      });
      setData(response.data.data);
      setTotalRows(response.data.total);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number): void => {
    setPage(page);
  };

  const handlePerRowsChange = (newPerPage: number, page: number): void => {
    setPerPage(newPerPage);
  };

  useEffect(() => {
    fetchData(page, perPage);
  }, [page, perPage]);

  const columns = [
    {
      name: 'ID',
      selector: (row: any) => row._id, // Display the MongoDB ID
      sortable: true,
      omit: true, // Hide the column if not required
    },
    {
      name: <strong>First name</strong>,
      selector: (row: any) => row.vfirst_name,
      sortable: true,
    },
    {
      name: <strong>Last name</strong>,
      selector: (row: any) => row.vlast_name,
      sortable: true,
    },
    {
      name: <strong>User name</strong>,
      selector: (row: any) => row.vuser_name,
      sortable: true,
    },
    {
      name: <strong>Email</strong>,
      selector: (row: any) => row.vemail,
      sortable: true,
    },
    {
      name: <strong>Status</strong>,
      selector: (row: any) => row.estatus,
      sortable: true,
    },
    {
      name: <strong>Action</strong>,
      cell: (row: any) => (
        <div>
          <button
            onClick={() => handleEdit(row)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginRight: '8px',
            }}
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDelete(row)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  const handleEdit = (row: any) => {
    setSelectedItem(row);
    setIsModalOpen(true);
    setIsisAction('Edit User');
  };
  
  const handleDelete = async(row: any) => {
    if (row._id) {
      const response = await axios.delete(`${apiBaseURL}/api/delete-user/${row._id}/`);
      if (response.status === 200) {
        alert(response.data.message || 'User deleted successfully!');
        fetchData(page, perPage);
      } else {
        alert(response.data.error || 'Failed to delete user.');
      }
    }
  };
  const handleAdd = (row: any) => {
    setSelectedItem(row);
    setIsModalOpen(true);
    setIsisAction('Add User');
  };
  return (
    <div className='min-w-full border-collapse border border-gray-200'>
    <DataTable
      title="Users List"
      columns={columns}
      data={data}
      progressPending={loading}
      className='custome-table'
      pagination
      paginationServer
      paginationTotalRows={totalRows}
      onChangePage={handlePageChange}
      onChangeRowsPerPage={handlePerRowsChange}
      actions={
              <button
                  className="add-btn inline-flex rounded-md bg-success text-white hover:bg-opacity-90"
                  onClick={() => handleAdd(data)}
                  >
                  <FaPlus className="mr-2" />
                  Add User
              </button>
      }
    />
    
    <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemDetails={selectedItem}
        IsisAction ={isAction}
        page={page} 
        perPage={perPage}
        fetchData={fetchData} 
      />
      </div>
  );
};

export default DataTableComponent;
