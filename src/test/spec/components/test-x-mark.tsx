import React from 'react';
import { render } from '@testing-library/react';
import { XMark } from '@/components/x-mark';

describe('XMark', () => {
  it('should render error icon elements', () => {
    render(<XMark />);
    const errorIcon = document.querySelector('.swal2-icon.swal2-error');

    expect(errorIcon).toBeTruthy();

    // Check for all the required elements that make up the error icon
    expect(document.querySelector('.swal2-x-mark-sign')).toBeTruthy();
    expect(document.querySelector('.swal2-x-mark-line-left')).toBeTruthy();
    expect(document.querySelector('.swal2-x-mark-line-right')).toBeTruthy();
  });
});
