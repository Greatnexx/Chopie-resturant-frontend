import { useState, useEffect } from "react";
import {
  useGetCategoriesQuery,
  useGetMenuItemsQuery,
} from "../slices/baseApiSlice";
import MenuList from "./MenuList";
import CategoryTab from "./CategoryTab";
import CustomerInfoTable from "./CustomerInfoTable";

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState("");

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesQuery();

  // Fetch menu items for active category (skip if no active category)
  const {
    data: menuData,
    isLoading: menuLoading,
    error: menuError,
  } = useGetMenuItemsQuery(activeCategory, {
    skip: !activeCategory || activeCategory === 'undefined', // Don't make the request if no active category
  });


  const categories = categoriesData?.data || [];
  const menuItems = menuData?.data || [];

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
      <CategoryTab
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={categories} 
      />
      
      <div className="max-w-6xl mx-auto px-4">
        <CustomerInfoTable />
      </div>

      {menuLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500"></div>
        </div>
      ) : menuError ? (
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
