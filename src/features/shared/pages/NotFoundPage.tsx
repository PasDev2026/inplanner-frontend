import { Link } from "react-router-dom";


export default function NotFound() {
  return (
    <>
        <h1 className="text-3xl font-black">404</h1>
        <h1 className="text-3xl font-black">Página no encontrada</h1> 
        <p>
            <Link className="text-brand-primary hover:underline" to={'/dashboard'}>
            Vovler a projectos
            </Link>
        </p>
    </>
  )
}
