import MenuItem from "./MenuItem";

const MenuList = ({ category, items = [], tenantBranding, restaurantId, onAddToCart, isStaffInterface = false, menuType = 'REGULAR' }) => {

  // Handle different data structures - the API returns data.menus
  const menuItems = items?.data?.menus || items?.menus || (Array.isArray(items) ? items : [])
  return (
    <div className="p-6 md:px-[50px] py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {menuItems && menuItems.length > 0 ? (
          menuItems.map((item) => (
            <MenuItem 
              key={item._id} 
              item={item} 
              tenantBranding={tenantBranding}
              restaurantId={restaurantId}
              onAddToCart={onAddToCart}
              isStaffInterface={isStaffInterface}
              menuType={menuType}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No items available in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuList;
