import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMemberSchema } from "@/features/projects/schemas/project.schema";
import type { TeamMemberFormulario } from "@/features/projects/schemas/project.schema";
import { useMutation } from "@tanstack/react-query";
import { getAllUsers } from "@/features/shared/actions/admin.api";
import SearchResult from "./SearchResult";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddMemberForm() {
  const initialValues: TeamMemberFormulario = {
    email: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamMemberFormulario>({
    defaultValues: initialValues,
    resolver: zodResolver(addMemberSchema),
  });

  const mutation = useMutation({
    mutationFn: (email: string) => getAllUsers(1, 5, email),
  });

  const handleSearchUser = async (formData: TeamMemberFormulario) => {
    mutation.mutate(formData.email);
  };

  const resetData = () => reset()

  const resetMutation = () => mutation.reset()

  const searchResult = mutation.data?.users?.[0] ?? null;

  return (
    <>
      <form
        className="mt-10 space-y-5"
        onSubmit={handleSubmit(handleSearchUser)}
        noValidate
      >
        <div className="flex flex-col gap-3">
          <Label htmlFor="email" className="font-normal text-2xl">
            E-mail de Usuario
          </Label>
          <Input
            id="email"
            type="text"
            placeholder="E-mail del usuario a agregar"
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full">
          Buscar Usuario
        </Button>
      </form>

      <div className="mt-10">
        {mutation.isPending && <p className="text-sm text-muted-foreground text-center">Cargando...</p>}
        {mutation.error instanceof Error && (
          <p className="text-sm text-destructive text-center">{mutation.error.message}</p>
        )}
        {mutation.data && !mutation.data.users.length && !mutation.isPending && (
          <p className="text-sm text-muted-foreground text-center">No se encontró ningún usuario con ese email</p>
        )}
        {searchResult && <SearchResult user={searchResult} reset={resetData} resetMutation={resetMutation} />}
      </div>
    </>
  );
}
