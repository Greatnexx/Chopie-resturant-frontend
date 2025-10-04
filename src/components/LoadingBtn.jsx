
const LoadingBtn = ({ bg }) => {
  return (
    <div>
      <button
        className={`w-full tracking-[1.25px] cursor-pointer h-[50px] mt-[23px] rounded-[5px] text-[20px]  text-white  flex gap-2 px-5 justify-center items-center ${bg}`}
        type="button"
        disabled={true}
      >
        <span>Loading</span>
        <div className="w-4 h-4 border-4 border-[#FFF] border-dotted rounded-full animate-spin mr-4"></div>
      </button>
    </div>
  );
};

export default LoadingBtn;
