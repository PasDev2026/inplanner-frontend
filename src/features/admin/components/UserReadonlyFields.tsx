import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { UserAdmin } from "../schemas/user.schema"

type UserReadonlyFieldsProps = {
  user: UserAdmin
  sedeName: string
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <Input value={value} disabled readOnly />
    </div>
  )
}

export default function UserReadonlyFields({
  user,
  sedeName,
}: UserReadonlyFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <ReadonlyField label="Nombres" value={user.name} />
      <ReadonlyField
        label="Apellido paterno"
        value={user.apellido_paterno ?? "—"}
      />
      <ReadonlyField
        label="Apellido materno"
        value={user.apellido_materno ?? "—"}
      />
      <ReadonlyField
        label="Documento"
        value={user.numero_documento ?? "—"}
      />
      <ReadonlyField label="Correo" value={user.email} />
      <ReadonlyField label="Sede" value={sedeName || "—"} />
    </div>
  )
}
