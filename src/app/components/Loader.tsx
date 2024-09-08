import TextFit from '@/app/components/TextFit';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef } from 'react';

export default function Loader() {
  const ref = useRef(null);
  return (
    <div
      className="flex size-full justify-center items-center top-0 absolute"
      ref={ref}
    >
      <TextFit widthFactor={0.6} heightFactor={0.6} refParent={ref}>
        <FontAwesomeIcon icon={faSpinner} spinPulse />
      </TextFit>
    </div>
  );
}
