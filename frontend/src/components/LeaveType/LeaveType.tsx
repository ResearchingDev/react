'use client'
import React from 'react';
import axios from 'axios';
import { useState,useEffect } from 'react';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import DataTable from 'react-data-table-component';
import LeaveTypeModal from './LeaveTypeModal';
const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
const DataTableComponent: React.FC = () => {
   const [data, setData] = useState<any[]>([]);
   const [loading, setLoading] = useState<boolean>(false);
   const [page, setPage] = useState<number>(1);
   const [perPage, setPerPage] = useState<number>(10);
   const [totalRows, setTotalRows] = useState<number>(0);
   const [selectedItem, setSelectedItem] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAction, setIsisAction] = useState<string>('Add Leave Type');
  const fetchData = async (page: number, perPage: number) => {
  setLoading(true);
  try {
    const response = await axios.get(`${apiBaseURL}/api/leave-type-list/`, {
      params: { page, per_page: perPage },
    });
    console.log(response.data.data)
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
      name: 'Leave Type',
      selector: (row: any) => row.vleave_type,
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
  const handleAdd = (row: any) => {
    setSelectedItem(null);
    setIsModalOpen(true);
    setIsisAction('Add Leave Type');
  };
  return (
    <div>
    <div className='main-page min-w-full border-collapse rounded-xl'>
    <DataTable
      title="Leave Type List"
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
            Add Leave Type
        </button>
      }
    />
    </div>
    <LeaveTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemDetails={selectedItem}
        data-row ={setSelectedItem}
        IsisAction ={isAction}
        fetchData={fetchData} 
        page={page} 
        perPage={perPage}
      />
      </div>
  );
};

export default DataTableComponent;
