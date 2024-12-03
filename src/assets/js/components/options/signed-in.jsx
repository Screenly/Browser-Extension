import React from 'react';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { signOut } from '@/features/auth/authSlice.js';

export const SignedIn = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async (event) => {
    event.preventDefault();

    setIsLoading(true);

    try {
      await browser.storage.sync.clear();
    } catch (error) {
      return;
    } finally {
      setIsLoading(false);
    }

    dispatch(signOut());
  };

  return (
    <div>
      <div className='page' id='signed-in-page'>
        <section>
          Signed in
        </section>
        <section className='mt-3'>
          <button
            className='btn btn-primary w-100'
            id='sign-out'
            type='submit'
            onClick={handleSignOut}
          >
            {
              isLoading
                ? (
                  <span
                    className='spinner spinner-border spinner-border-sm'
                  ></span>
                )
                : <span className='label'>Sign Out</span>
            }
          </button>
        </section>
      </div>
    </div>
  );
};

