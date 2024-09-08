'use client';

import DimensionInput from '@/app/components/modules/draft/DimensionInput';
import useModules from '@/app/hooks/useModules';
import useNotification from '@/app/hooks/useNotification';
import { updateModule } from '@/app/lib/actions';
import {
  Dimensions,
  DraftProps,
  ModuleInputsType,
  moduleInputs,
} from '@/app/lib/definitions';
import { moduleKeysInfo } from '@/app/lib/utils';
import { isDimensionValid, validateDimension } from '@/app/lib/utils/dimension';
import { useSpeechRecognition } from 'react-speech-recognition';

export default function SelectModuleDimension({
  draft,
}: {
  draft: DraftProps;
}) {
  const { setModules } = useModules();
  const { showNotification } = useNotification();

  const getMax = (dimensionType: ModuleInputsType) => {
    switch (dimensionType) {
    case 'posX':
      return 13 - draft.width;
    case 'posY':
      return 13 - draft.height;
    case 'width':
      return 13 - draft.posX;
    case 'height':
      return 13 - draft.posY;
    }
  };

  function processDimension(dimensions: Dimensions) {
    let error = false;

    for (const [dimensionType, dimension] of Object.entries(
      dimensions
    ) as Array<[keyof Dimensions, number]>) {
      const validDimension = validateDimension(dimension);
      dimensions[dimensionType] = validDimension;
      if (
        !isDimensionValid(validDimension) ||
        validDimension > getMax(dimensionType)
      ) {
        error = true;
        const label = moduleKeysInfo[dimensionType].label;
        showNotification(
          `La ${label} doit être comprise entre 1 et ${getMax(dimensionType)}`
        );
      }
    }

    if (!error) {
      const update = async () => {
        setModules(await updateModule(draft.id, dimensions));
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 10);
      };
      update();
    }
  }

  useSpeechRecognition({
    commands: [
      {
        command: ['Position(s) :posX :posY'],
        callback: (posX, posY) => {
          if (posX !== 'horizontale' && posX !== 'verticale') {
            processDimension({ posX, posY });
          }
        },
      },
      {
        command: ['Dimension(s) :width (sur) :height'],
        callback: (width, height) => {
          processDimension({ width, height });
        },
      },
    ],
  });

  return (
    <>
      {moduleInputs.map((dimensionType) => (
        <DimensionInput
          key={dimensionType}
          draft={draft}
          dimensionType={dimensionType}
          label={moduleKeysInfo[dimensionType].label}
          max={getMax(dimensionType)}
          processDimension={processDimension}
        />
      ))}
    </>
  );
}
