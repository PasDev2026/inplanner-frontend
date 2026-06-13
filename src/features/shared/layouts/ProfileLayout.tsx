import { Outlet } from "react-router-dom";
import Tabs from "@/features/profile/components/Tabs";

export default function ProfileLayout() {
  return (
    <div>
        <Tabs />
        <Outlet />
    </div>
  )
}
