import '@fortawesome/fontawesome-svg-core/styles.css';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function ServerLoader() {
  return (
    <div className="flex size-full justify-center items-center top-0 absolute">
      <FontAwesomeIcon icon={faSpinner} spinPulse fontSize={'75vw'} />
    </div>
  );
}
