import { useLocation, useNavigate } from 'react-router-dom';
import AddMemberForm from './AddMemberForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AddMemberModal() {

    const location = useLocation()
    const navigate = useNavigate()

    const queryParams = new URLSearchParams(location.search);
    const addMember = queryParams.get('addMember');
    const show = addMember ? true : false

    return (
        <Dialog open={show} onOpenChange={() => navigate(location.pathname, { replace: true })}>
            <DialogContent className="max-w-4xl p-16">
                <DialogHeader>
                    <DialogTitle className="font-black text-4xl my-5">
                        Agregar Integrante al equipo
                    </DialogTitle>
                </DialogHeader>
                <p className="text-xl font-bold">Busca el nuevo integrante por email {''}
                    <span className="text-fuchsia-600">para agregarlo al proyecto</span>
                </p>

                <AddMemberForm />
            </DialogContent>
        </Dialog>
    )
}
