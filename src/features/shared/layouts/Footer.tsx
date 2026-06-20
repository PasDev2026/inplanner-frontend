export default function Footer() {
  return (
    <footer className="bg-card rounded-lg shadow p-4">
      
        <hr className="my-6 border-border sm:mx-auto lg:my-8" />
        <span className="block text-sm text-muted-foreground sm:text-center">
          © {new Date().getFullYear()}{" "}
          <a href="/" className="hover:underline">
            InPlanner
          </a>
          . All Rights Reserved.
        </span>
     
    </footer>
  );
}
