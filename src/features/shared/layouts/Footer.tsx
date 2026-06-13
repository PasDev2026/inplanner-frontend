export default function Footer() {
  return (
    <footer className="bg-white rounded-lg shadow dark:bg-gray-900 p-4">
      
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © {new Date().getFullYear()}{" "}
          <a href="https://flowbite.com/" className="hover:underline">
            InPlanner
          </a>
          . All Rights Reserved.
        </span>
     
    </footer>
  );
}
