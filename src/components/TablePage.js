import React, { useEffect, useState } from 'react';
import useFetchData from '../hooks/useFetchData';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';  // Import DataTables functionality

// Use DataTables functionality
DataTable.use(DT);

function TablePage() {
  const { data, loading, error } = useFetchData('https://jsonplaceholder.typicode.com/users');
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchAddress, setSearchAddress] = useState('');

  useEffect(() => {
    if (data) {
      // Map data to separate fields for each column
      const formattedData = data.map((user, index) => [
        user.name,
        user.email,
        user.address.street,  // We assume you want to display just the street for simplicity
        `<div key={index} class="text-center">
        <button class="btn btn-success edit-button btn-sm me-2">
          Edit
        </button>
        <button class="btn btn-danger delete-button btn-sm">
          Delete
        </button>
      </div>`
      ]);
      setTableData(formattedData);
      setFilteredData(formattedData);  // Set initial data to filteredData
    }
  }, [data]);

  // Handle individual column search
  const handleSearch = () => {
    const filtered = tableData.filter(item => {
      return (
        item[0].toLowerCase().includes(searchName.toLowerCase()) &&  // Name filter
        item[1].toLowerCase().includes(searchEmail.toLowerCase()) &&  // Email filter
        item[2].toLowerCase().includes(searchAddress.toLowerCase())   // Address filter
      );
    });
    setFilteredData(filtered)
  };

  // Reset all search fields and data
  const handleReset = () => {
    setSearchName('');
    setSearchEmail('');
    setSearchAddress('');
    setFilteredData(tableData);  // Reset the filtered data to original tableData
  };
  const handleEdit = (row) => {
    // setEditingRow(row);
  };
    // Delete Handler
    const handleDelete = (rowId) => {
      // setData((prevData) => prevData.filter((item) => item.id !== rowId));
    };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Data Table</h2>
      <div className="card">
        <h5 className="card-header">Search Filters</h5>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="searchName">Search Name</label>
                <input
                  type="text"
                  id="searchName"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Search Name..."
                  className="form-control"
                />
              </div>
            </div>

            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="searchEmail">Search Email</label>
                <input
                  type="text"
                  id="searchEmail"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Search Email..."
                  className="form-control"
                />
              </div>
            </div>

            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="searchAddress">Search Address</label>
                <input
                  type="text"
                  id="searchAddress"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder="Search Address..."
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex justify-content-end mt-4">
                <button onClick={handleSearch} className="btn btn-primary me-2">Search</button>
                <button onClick={handleReset} className="btn btn-secondary">Reset</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DataTable data={filteredData} className="table table-bordered table-striped datatable"
        options={{
          paging: true,
          pageLength: 5,
          searching: true,
          ordering: true,
          responsive: true,
          autoWidth: false,
        }}
      >
        <thead className='table-light'>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th className='text-center' width="15%">Action</th>
          </tr>
        </thead>
      </DataTable>
    </div>
  );
}

export default TablePage;
