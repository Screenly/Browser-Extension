import 'sweetalert2/src/sweetalert2.scss';

export const Checkmark: React.FC = () => {
  return (
    <div className="swal2-icon swal2-success swal2-icon-show">
      <div className="swal2-success-circular-line-left"></div>
      <span className="swal2-success-line-tip"></span>
      <span className="swal2-success-line-long"></span>
      <div className="swal2-success-ring"></div>
      <div className="swal2-success-fix"></div>
      <div className="swal2-success-circular-line-right"></div>
    </div>
  );
};
