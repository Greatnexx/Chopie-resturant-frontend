import { useState, useEffect } from "react";
import {
  useGetCategoriesQuery,
  useGetMenuItemsQuery,
} from "../slices/baseApiSlice";
import MenuList from "./MenuList";
import CategoryTab from "./CategoryTab";

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
    skip: !activeCategory, // Don't make the request if no active category
  });


  const categories = categoriesData?.data || [];
  const menuItems = menuData?.data || [];

  // Set first category as active by default when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]._id); // Set first category as active
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
