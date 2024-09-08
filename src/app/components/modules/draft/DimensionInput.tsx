import { DraftProps, ModuleInputsType } from '@/app/lib/definitions';
import { MicrophoneIcon } from '@heroicons/react/24/solid';
import { sentenceCase } from 'change-case';
import { useSpeechRecognition } from 'react-speech-recognition';

export default function DimensionInput({
  draft,
  dimensionType,
  label,
  processDimension,
  max,
}: {
  draft: DraftProps;
  dimensionType: ModuleInputsType;
  label: string;
  processDimension: Function;
  max: number;
}) {
  useSpeechRecognition({
    commands: [
      {
        command: [`${label} :value`],
        callback: (value) => {
          processDimension({ [dimensionType]: value });
        },
      },
    ],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    processDimension({ [dimensionType]: value });
  };

  return (
    <div>
      <MicrophoneIcon className="size-4 inline-flex" />
      <label>
        {sentenceCase(label)} :&nbsp;
        <input
          type="number"
          min={1}
          max={max}
          value={draft[dimensionType]}
          style={{ backgroundColor: 'transparent' }}
          onChange={handleChange}
        />
      </label>
    </div>
  );
}
