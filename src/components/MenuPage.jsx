import { useState, useEffect } from "react";
import {
  useGetCategoriesQuery,
  useGetMenuItemsQuery,
  useGetMenuItemsByTableQuery,
} from "../slices/baseApiSlice";
import MenuList from "./MenuList";
import CategoryTab from "./CategoryTab";

import EventPopup from "./EventPopup";

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [menuType, setMenuType] = useState("");

  // Get table number from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const table = urlParams.get('table');
    if (table) {
      setTableNumber(table);
      // Determine menu type from table number
      const type = table.toUpperCase().startsWith('VIP') ? 'VIP' : 'REGULAR';
      setMenuType(type);
    }
  }, []);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesQuery();

  // Fetch menu items for active category
  // Use table-based query if table number is available, otherwise use regular query
  const {
    data: menuData,
    isLoading: menuLoading,
    error: menuError,
  } = useGetMenuItemsByTableQuery(
    { categoryId: activeCategory, tableNumber },
    {
      skip: !activeCategory || activeCategory === 'undefined' || !tableNumber,
    }
  );

  // Fallback to regular menu query if no table number
  const {
    data: fallbackMenuData,
    isLoading: fallbackMenuLoading,
    error: fallbackMenuError,
  } = useGetMenuItemsQuery(activeCategory, {
    skip: !activeCategory || activeCategory === 'undefined' || !!tableNumber,
  });


  const categories = categoriesData?.data || [];
  const menuItems = tableNumber 
    ? (menuData?.data || menuData || []) 
    : (fallbackMenuData?.data || []);
  
  const currentMenuLoading = tableNumber ? menuLoading : fallbackMenuLoading;
  const currentMenuError = tableNumber ? menuError : fallbackMenuError;

  // Debug logging
  console.log('Active Category:', activeCategory);
  console.log('Table Number:', tableNumber);
  console.log('Menu Data:', tableNumber ? menuData : fallbackMenuData);
  console.log('Menu Items:', menuItems);
  console.log('Menu Items Count:', menuItems?.length || 0);



  // Set first category as active by default when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      console.log('Categories:', categories);
      console.log('First category:', categories[0]);
      const firstCategoryId = categories[0]._id || categories[0].id;
      console.log('Setting active category to:', firstCategoryId);
      setActiveCategory(firstCategoryId);
    }
  }, [categories, activeCategory]);

  if (categoriesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div>
      <EventPopup />
      <CategoryTab
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={categories} 
      />
      


      {/* Menu Type Indicator */}
      {tableNumber && menuType && (
        <div className="max-w-6xl mx-auto px-4 mb-6 mt-6">
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
            menuType === 'VIP' 
              ? 'bg-gold-100 text-gold-800 border border-gold-300' 
              : 'bg-blue-100 text-blue-800 border border-blue-300'
          }`}>
            {menuType === 'VIP' ? '👑 VIP Menu' : '🍽️ Regular Menu'} - Table {tableNumber}
          </div>
        </div>
      )}

      {currentMenuLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500"></div>
        </div>
      ) : currentMenuError ? (
        <div className="text-center py-8 text-red-500">
          Error loading menu items
        </div>
      ) : (
        <MenuList category={activeCategory} items={menuItems} />
      )}
    </div>
  );
};

export default MenuPage;
