import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import DataTableComponent from "@/components/Users/ManageUsers";
export const metadata: Metadata = {
  title: "BuiAdmin - Manage Users",
  description:
    "This is Next.js Tables page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};
const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Users" />
      <div className="flex flex-col gap-10">
        <DataTableComponent />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
