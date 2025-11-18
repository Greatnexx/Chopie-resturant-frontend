import { useState, useEffect } from 'react';
import { Settings, Server, Globe } from 'lucide-react';

const EnvSwitcher = () => {
  const [isLocal, setIsLocal] = useState(() => {
    return localStorage.getItem('useLocalAPI') === 'true';
  });
  
  const [showSwitcher, setShowSwitcher] = useState(false);

  const localURL = 'http://localhost:8000/api/v1';
  const renderURL = 'https://backend-chopie-project.onrender.com/api/v1';

  useEffect(() => {
    // Update the environment variable
    const newBaseURL = isLocal ? localURL : renderURL;
    
    // Store in localStorage
    localStorage.setItem('useLocalAPI', isLocal.toString());
    localStorage.setItem('VITE_BASE_URL', newBaseURL);
    
    // Update the actual env variable if possible
    if (window.location.hostname === 'localhost') {
      import.meta.env.VITE_BASE_URL = newBaseURL;
    }
    
    console.log(`API switched to: ${newBaseURL}`);
  }, [isLocal]);

  const toggleEnvironment = () => {
    setIsLocal(!isLocal);
    // Show a toast or notification
    const message = !isLocal ? 'Switched to Local API' : 'Switched to Render API';
    console.log(message);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setShowSwitcher(!showSwitcher)}
        className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Environment Switcher"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Switcher Panel */}
      {showSwitcher && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[280px]">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Server className="w-4 h-4" />
            API Environment
          </h3>
          
          <div className="space-y-3">
            {/* Local Option */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="environment"
                checked={isLocal}
                onChange={() => setIsLocal(true)}
                className="text-blue-500"
              />
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="font-medium text-gray-800">Local</div>
                  <div className="text-xs text-gray-500">localhost:8000</div>
                </div>
              </div>
            </label>

            {/* Render Option */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="environment"
                checked={!isLocal}
                onChange={() => setIsLocal(false)}
                className="text-green-500"
              />
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-500" />
                <div>
                  <div className="font-medium text-gray-800">Render</div>
                  <div className="text-xs text-gray-500">backend-chopie-project.onrender.com</div>
                </div>
              </div>
            </label>
          </div>

          {/* Current Status */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              Current: <span className="font-medium">{isLocal ? localURL : renderURL}</span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowSwitcher(false)}
            className="mt-3 w-full text-xs text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default EnvSwitcher;