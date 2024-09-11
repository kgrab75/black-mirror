import useDimensions from '@/app/hooks/useDimensions';
import { ReactNode, useEffect, useState } from 'react';

export default function TextFit({
  widthFactor,
  heightFactor,
  children,
  refParent,
}: {
  widthFactor: number;
  heightFactor: number;
  children: ReactNode;
  refParent: React.RefObject<HTMLInputElement>;
}) {
  const dimensions = useDimensions(refParent);
  const [fontSize, setFontSize] = useState(0);

  useEffect(() => {
    if (dimensions.width === 0 && dimensions.height === 0) return;

    let calculatedFontSize = 0;

    if (dimensions.width === 0) {
      calculatedFontSize = dimensions.height * heightFactor;
    } else if (dimensions.height === 0) {
      calculatedFontSize = dimensions.width * widthFactor;
    } else {
      calculatedFontSize = Math.min(
        dimensions.width * widthFactor,
        dimensions.height * heightFactor
      );
    }

    setFontSize(Math.round(calculatedFontSize));
  }, [dimensions, widthFactor, heightFactor]);

  return <div style={{ fontSize, height: 'inherit' }}>{children}</div>;
}
