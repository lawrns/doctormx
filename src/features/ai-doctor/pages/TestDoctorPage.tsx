import React from 'react';

function TestDoctorPage() {
  console.log('TestDoctorPage component is rendering!');
  
  return (
    <div style={{ 
      backgroundColor: 'red', 
      color: 'white', 
      padding: '20px', 
      fontSize: '24px',
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <h1>DOCTOR PAGE IS WORKING - THIS IS A TEST - RED SCREEN</h1>
    </div>
  );
}

export default TestDoctorPage;