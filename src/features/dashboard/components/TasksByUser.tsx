import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import CircularProgress from "@/components/ui/CircularProgress"

type TasksByUserItem = {
  userId: string
  name: string
  email: string
  pending: number
  total: number
}

type TasksByUserProps = {
  data: TasksByUserItem[]
}

export default function TasksByUser({ data }: TasksByUserProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold">Tareas pendientes por usuario</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[350px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-center">Pendientes</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Avance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow className="even:bg-muted/30 hover:bg-muted/50 transition-colors">
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Sin datos
                </TableCell>
              </TableRow>
            ) : (
              data.map((user) => {
                const pct = user.total > 0 ? Math.round(((user.total - user.pending) / user.total) * 100) : 0
                return (
                  <TableRow key={user.userId} className="even:bg-muted/30 hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{user.pending}</TableCell>
                    <TableCell className="text-center">{user.total}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <CircularProgress percentage={pct} size="sm" />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  )
}
