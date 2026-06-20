import { Suspense } from "react"
import { Outlet } from "react-router-dom";
import Tabs from "@/features/profile/components/Tabs";
import PageSpinner from "@/components/ui/PageSpinner";

export default function ProfileLayout() {
  return (
    <div>
        <Tabs />
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
    </div>
  )
}
