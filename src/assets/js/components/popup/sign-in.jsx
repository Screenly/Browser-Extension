import React from 'react';

export const PopupSignIn = () => {
  const handleSignIn = async (event) => {
    browser.runtime.openOptionsPage();
  };

  return (
    <div className='page' id='sign-in-page'>
      <div className='d-flex flex-column'>
        <section className='align-items-center d-flex flex-grow-1 justify-content-center'>
          <div className='text-center'>
            <img src='assets/images/screenly-logo-128.png' width='64' />
            <h1 className='mb-1 mt-2'>Screenly</h1>
            <a href='https://screenly.io'>
              screenly.io
            </a>
          </div>
        </section>
        <section>
          <button
            className='btn btn-primary w-100'
            id='open-sign-in'
            onClick={handleSignIn}
          >
            Sign In
          </button>
        </section>
      </div>
    </div>
  );
};
