import { useBranding } from '../Context/BrandingContext';

const CategoryTab = ({ activeCategory, setActiveCategory, categories }) => {
  const { branding } = useBranding();
  
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  return (
    <div className="bg-white shadow-sm sticky top-16 z-40">
      <div className="flex overflow-x-auto scrollbar-hide">
        {categories &&
          categories.map((category) => (
            <div
              key={category._id}
              onClick={() => handleCategoryChange(category._id)}
              className={`px-6 py-4 whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === category._id
                  ? "font-semibold border-b-4"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
              style={{
                color: activeCategory === category._id ? branding.primaryColor : undefined,
                borderBottomColor: activeCategory === category._id ? branding.primaryColor : 'transparent'
              }}
            >
              <div className="flex items-center">
                <span className="mr-1">{category.image}</span>
                <p className="capitalize text-black font-medium">
                  {category.name}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CategoryTab;
