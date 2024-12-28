import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ManageUserList from "@/components/Users/ManageUsers";

export const metadata: Metadata = {
  title: "BuiAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Tables page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Manage Users" />
      
      <div className="flex flex-col gap-10">
        <ManageUserList />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
