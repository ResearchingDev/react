import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import DataTableComponent from "@/components/UserRoles/ManageUserRoles";
export const metadata: Metadata = {
  title: "BuiAdmin - Manage User Roles",
  description:
    "This is Next.js Tables page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};
const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="User Role" />
      <div className="flex flex-col gap-10">
        <DataTableComponent />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
