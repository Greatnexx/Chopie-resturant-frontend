
const NotFound = () => {
  return (
    <div>
        <h1 className="text-4xl font-bold text-center mt-20">404 - Page Not Found</h1>
        <p className="text-center text-gray-600 mt-4">The page you are looking for does not exist.</p>
        <div className="flex justify-center mt-10">
            <img src="/images/not-found.png" alt="Not Found" className="w-1/2 h-auto" />
        </div>
        <div className="text-center mt-6">
            <a href="/" className="text-red-500 hover:underline">Go back to Home</a>
        </div>
        <div className="text-center mt-4">
            <p className="text-sm text-gray-500">If you think this is an error, please contact support.</p>
        </div>
      
    </div>
  )
}

export default NotFound
