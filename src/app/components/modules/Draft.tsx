'use client';

import TextFit from '@/app/components/TextFit';
import { DraftProps } from '@/app/lib/definitions';
import { getIcon } from '@/app/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef } from 'react';

export default function Draft({ temporaryType }: DraftProps) {
  const ref = useRef(null);

  return (
    <>
      <div
        className="absolute flex items-center size-full justify-center"
        ref={ref}
      >
        <TextFit heightFactor={0.8} widthFactor={0.8} refParent={ref}>
          <FontAwesomeIcon icon={getIcon(temporaryType)} opacity={0.4} />
        </TextFit>
      </div>
    </>
  );
}
