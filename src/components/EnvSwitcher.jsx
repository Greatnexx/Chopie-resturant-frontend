import { useState, useEffect } from 'react';

const EnvSwitcher = () => {
  const [useRemote, setUseRemote] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('USE_REMOTE_SERVER');
    setUseRemote(stored === 'true');
  }, []);

  const handleSwitch = (remote) => {
    if (remote) {
      localStorage.setItem('USE_REMOTE_SERVER', 'true');
    } else {
      localStorage.removeItem('USE_REMOTE_SERVER');
    }
    setUseRemote(remote);
    window.location.reload(); // Refresh to apply changes
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '10px',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>Server:</div>
      <button
        onClick={() => handleSwitch(false)}
        style={{
          background: !useRemote ? '#4CAF50' : '#f0f0f0',
          color: !useRemote ? 'white' : 'black',
          border: 'none',
          padding: '5px 10px',
          marginRight: '5px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Local
      </button>
      <button
        onClick={() => handleSwitch(true)}
        style={{
          background: useRemote ? '#2196F3' : '#f0f0f0',
          color: useRemote ? 'white' : 'black',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Remote
      </button>
    </div>
  );
};

export default EnvSwitcher;