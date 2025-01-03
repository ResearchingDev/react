"use client"; 
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import DataTableComponent from "@/components/UserRoles/ManageUserRoles";
import { useRouter } from 'next/navigation'
const TablesPage = () => {
  const router = useRouter();
  const id = sessionStorage.getItem('userId') || '';
  if (!id) {
    sessionStorage.clear();
    router.push('/');
    return;
  }
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
