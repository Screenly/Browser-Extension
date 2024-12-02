import React from 'react';
import { useSelector } from 'react-redux';

export const Success = () => {
  const assetDashboardLink = useSelector((state) => state.popup.assetDashboardLink);

  const openAssetDashboard = async () => {
    window.open(assetDashboardLink);
  };

  return (
    <div className='page' id='success-page'>
      <div className='d-flex flex-column'>
        <section
          className='align-items-center d-flex flex-grow-1 justify-content-center'
        >
          <div>
            <div className='mt-4 success-checkmark'>
              <div className='check-icon'>
                <span className='icon-line line-tip'></span>
                <span className='icon-line line-long'></span>
                <div className='icon-circle'></div>
                <div className='icon-fix'></div>
              </div>
            </div>
            <h3 className='text-center'>
              Web page saved!
            </h3>
            <p className='text-muted'>
              To show the web page on your digital sign, add the
              web asset to a playlist in your Screenly account.
            </p>
          </div>
        </section>
        <section>
          <button
            className='btn btn-primary w-100'
            id='view-it'
            onClick={openAssetDashboard}
          >
            <span className='label'>View Asset</span>
          </button>
        </section>
      </div>
    </div>
  );
};


