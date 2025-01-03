'use client'
import React from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa'; // For icons
import EditModal from './EditModal';
import Link from "next/link";
import { deleteItem } from '../../api/user';
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
      const response = await axios.get(`${apiBaseURL}/api/records/`, {
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
    fetchData(page, perPage);
  };

  const handlePerRowsChange = (newPerPage: number, page: number): void => {
    setPerPage(newPerPage);
    fetchData(page, newPerPage);
  };

  useEffect(() => {
    fetchData(page, perPage);
  }, [page, perPage]);

  const columns = [
    {
      name: 'User Role',
      selector: (row: any) => row.vrole_name,
      sortable: true,
    },
    {
      name: 'Status',
      selector: (row: any) => row.estatus,
      sortable: true,
    },
    {
      name: 'Action',
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
    console.log(row)
    setSelectedItem(row);
    setIsModalOpen(true);
    setIsisAction('Edit User');
  };
  
  const handleDelete = async (row: any) => {
    await deleteItem(row._id);
    fetchData(page, perPage);
  };
  const handleAdd = (row: any) => {
    setSelectedItem(row);
    setIsModalOpen(true);
    setIsisAction('Add User');
  };
  return (
    <div>
    <DataTable
      title="User Role Lists"
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
            Add Role
        </button>
      }
    />
    
    <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemDetails={selectedItem}
        data-row ={setSelectedItem}
        IsisAction ={isAction}
        fetchData={fetchData} 
        page={page} 
        perPage={perPage}
        onSave={handleDelete}
      />
      </div>
  );
};

export default DataTableComponent;
