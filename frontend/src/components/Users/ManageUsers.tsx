
'use client'
import React from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa'; // For icons
import EditModal from './EditModal';
import Link from "next/link";
const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
const DataTableComponent: React.FC = () => {
  const [data, setData] = useState<any[]>([]); // Adjust `any[]` to your data structure type if known
  const [totalRows, setTotalRows] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      selector: (row: any) => row.userrole,
      sortable: true,
    },
    {
      name: 'Status',
      selector: (row: any) => row.status,
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
    setSelectedItem(row);
    setIsModalOpen(true);
  };
  
  const handleDelete = (row: any) => {
    console.log('Delete clicked for:', row);
  };
  return (
    <div>
    <DataTable
      title="User Role Lists"
      columns={columns}
      data={data}
      progressPending={loading}
      pagination
      paginationServer
      paginationTotalRows={totalRows}
      onChangePage={handlePageChange}
      onChangeRowsPerPage={handlePerRowsChange}
      actions={
        <Link href="/users/add-user"
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              cursor: 'pointer',
              marginBottom: '10px',
              display: 'inline-flex',
              alignItems: 'center', // Align icon and text
            }}
          >
            <FaPlus style={{ marginRight: '8px' }} />
            Add New Role
        </Link>
      }
    />
    
    <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemDetails={selectedItem}
        data-row ={setSelectedItem}
        onSave={handleDelete}
      />
      </div>
  );
};

export default DataTableComponent;
