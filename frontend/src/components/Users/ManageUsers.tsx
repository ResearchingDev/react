"use client"
import React from "react";
import DataTable from "react-data-table-component";


const data = [
  { id: 1, name: "Richard Crossley", email: "richard.crossley@buiadmin.com", role: "Standard", msince: "07/25/2022 15:02", lastlog: "07/25/2022 15:02", status: "Active" },
  { id: 1, name: "Richard Crossley", email: "richard.crossley@buiadmin.com", role: "Standard", msince: "07/25/2022 15:02", lastlog: "07/25/2022 15:02", status: "Active" },
  { id: 1, name: "Richard Crossley", email: "richard.crossley@buiadmin.com", role: "Standard", msince: "07/25/2022 15:02", lastlog: "07/25/2022 15:02", status: "Active" },
  { id: 1, name: "Richard Crossley", email: "richard.crossley@buiadmin.com", role: "Standard", msince: "07/25/2022 15:02", lastlog: "07/25/2022 15:02", status: "Active" },
  { id: 1, name: "Richard Crossley", email: "richard.crossley@buiadmin.com", role: "Standard", msince: "07/25/2022 15:02", lastlog: "07/25/2022 15:02", status: "Active" },
  { id: 1, name: "Richard Crossley", email: "richard.crossley@buiadmin.com", role: "Standard", msince: "07/25/2022 15:02", lastlog: "07/25/2022 15:02", status: "Active" },
];

const columns = [
  {
    name: "Name",
    selector: (row: { name: any; }) => row.name,
    sortable: true,
  },
  {
    name: "Email",
    selector: (row: { email: any; }) => row.email,
    sortable: true,
  },
  {
    name: "User Role",
    selector: (row: { role: any; }) => row.role,
    sortable: true,
  },
  {
    name: "Member Since",
    selector: (row: { msince: any; }) => row.msince,
    sortable: true,
  },
  {
    name: "Last Logged in",
    selector: (row: { lastlog: any; }) => row.lastlog,
    sortable: true,
  },
  {
    name: "Status",
    selector: (row: { status: any; }) => row.status,
    sortable: true,
  },
];
const ManageUserList = () => {
  return (
    <div className="custom-datatable">
      <DataTable
        columns={columns}
        data={data}
        pagination
      />
    </div>
  );
};

export default ManageUserList;
