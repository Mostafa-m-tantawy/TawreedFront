import { Notification } from "iconsax-reactjs";

const DashboardLayoutHeader = () => {
  return (
    <header className="p-5 bg-white flex justify-end items-center border-b border-[#F0F0F4]">
      <div className="flex gap-4">
        <button
          type="button"
          className="w-8 h-8 flex-center rounded-full hover:bg-gray-100"
        >
          <Notification size={16} />
        </button>

        <button type="button" className="rounded-full hover:bg-gray-50">
          <img
            src="https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt=""
            className="w-8 h-8 rounded-full"
          />
        </button>
      </div>
    </header>
  );
};

export default DashboardLayoutHeader;
