import React, { useState } from 'react';
import { AdminLayout } from './components'; 
import { PropertyOwner } from './pages'; 

function App() {
  const [activeTab, setActiveTab] = useState('propertyOwners');

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <PropertyOwner />
    </AdminLayout>
  );
}

export default App;