import React from 'react';
import 'sweetalert2/src/sweetalert2.scss';

export const XMark: React.FC = () => {
  return (
    <div className="swal2-icon swal2-error swal2-icon-show mb-3">
      <span className="swal2-x-mark-sign">
        <span className="swal2-x-mark-line-left"></span>
        <span className="swal2-x-mark-line-right"></span>
      </span>
    </div>
  );
};
