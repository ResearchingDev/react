"use client"; 
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import DataTableComponent from "@/components/LeaveType/LeaveType";
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
      <Breadcrumb pageName="Leave Type" />
      <div className="flex flex-col gap-10">
        <DataTableComponent />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
