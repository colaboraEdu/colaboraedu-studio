import React from 'react';

export const TestApp: React.FC = () => {
  console.log('[TestApp] Rendering...');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: 'blue' }}>✅ React está funcionando!</h1>
      <p>Se você está vendo esta mensagem, o React está carregando corretamente.</p>
      <p>Timestamp: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default TestApp;
