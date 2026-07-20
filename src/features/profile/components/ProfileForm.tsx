import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ProfileFormProps = {
  data: { nombres: string; apellidoPaterno: string; email: string; numDocumento: string }
}

export default function ProfileForm({ data }: ProfileFormProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">Mi Perfil</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Información personal
      </p>

      <div className="mt-10 space-y-6">
        <div>
          <Label>Nombre</Label>
          <Input type="text" value={`${data.nombres} ${data.apellidoPaterno}`} className="mt-1" disabled />
        </div>

        <div>
          <Label>N° Documento</Label>
          <Input type="text" value={data.numDocumento} className="mt-1" disabled />
        </div>

        <div>
          <Label>Correo electrónico</Label>
          <Input type="text" value={data.email} className="mt-1" disabled />
        </div>
      </div>
    </div>
  )
}
