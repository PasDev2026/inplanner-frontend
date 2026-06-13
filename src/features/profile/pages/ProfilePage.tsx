import ProfileForm from "@/features/profile/components/ProfileForm"
import Spinner from "@/components/ui/Spinner"
import { useAuth } from "@/features/auth/hooks/useAuth"

export default function ProfilePage() {
    const {data, isLoading} = useAuth()

    if(isLoading) return <Spinner />

  if(data) return <ProfileForm data={data} />
}
