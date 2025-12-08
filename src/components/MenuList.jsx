import MenuItem from "./MenuItem";

const MenuList = ({ category, items = [] }) => {

  // Handle different data structures
  const menuItems = items?.menus || items?.data?.menus || (Array.isArray(items) ? items : [])   

  return (
    <div className="p-6 md:px-[50px] py-16">
      {/* <h2 className="text-2xl font-bold mb-4 capitalize">{category}</h2> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {menuItems && menuItems.length > 0 ? (
          menuItems.map((item) => (
            <MenuItem key={item._id} item={item} />
          ))
        ) : (
          <p className="text-gray-500">No items in this category.</p>
        )}
      </div>
    </div>
  );
};

export default MenuList;
