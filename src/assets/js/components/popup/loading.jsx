import React from 'react';

export const PopupLoading = () => {
  return (
    <div className='page' id='working-page'>
      <div className='align-items-center d-flex h-100 justify-content-center'>
        <div className='spinner spinner-border'>
          <span className='sr-only'></span>
        </div>
      </div>
    </div>
  );
};

