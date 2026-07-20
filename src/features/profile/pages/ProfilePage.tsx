import ProfileForm from "@/features/profile/components/ProfileForm"
import PageSpinner from "@/components/ui/PageSpinner"
import { useAuth } from "@/features/auth/hooks/useAuth"

export default function ProfilePage() {
    const {data, isLoading} = useAuth()

    if(isLoading) return <PageSpinner />

  if(data) return <ProfileForm data={{ ...data, email: data.email ?? '' }} />
}
