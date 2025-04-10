import React from 'react';
import { render } from '@testing-library/react';
import { CheckMark } from '@/components/check-mark';

describe('CheckMark', () => {
  it('should render success icon elements', () => {
    render(<CheckMark />);
    const successIcon = document.querySelector('.swal2-icon.swal2-success');

    expect(successIcon).toBeTruthy();

    // Check for all the required elements that make up the success icon
    expect(
      document.querySelector('.swal2-success-circular-line-left'),
    ).toBeTruthy();

    expect(document.querySelector('.swal2-success-line-tip')).toBeTruthy();
    expect(document.querySelector('.swal2-success-line-long')).toBeTruthy();
    expect(document.querySelector('.swal2-success-ring')).toBeTruthy();
    expect(document.querySelector('.swal2-success-fix')).toBeTruthy();
    expect(
      document.querySelector('.swal2-success-circular-line-right'),
    ).toBeTruthy();
  });
});
