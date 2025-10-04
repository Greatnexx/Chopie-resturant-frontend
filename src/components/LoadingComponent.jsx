const LoadingComponent = () => {
  return (
    <div className="flex justify-center items-center space-y-4 flex-col">
      <div className="w-16 h-16 border-[10px] border-[#fa9e1f] border-dotted rounded-full animate-spin mr-4"></div>
      <p>Loading component.Please wait...</p>
    </div>
  );
};

export default LoadingComponent;
