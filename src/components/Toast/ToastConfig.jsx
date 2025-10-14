import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastConfig = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={2500}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      toastClassName="custom-toast"
      bodyClassName="custom-toast-body"
      progressClassName="custom-toast-progress"
      enableMultiContainer={false}
      limit={5}
      style={{
        fontSize: '14px',
        fontFamily: 'inherit'
      }}
    />
  );
};

export default ToastConfig;