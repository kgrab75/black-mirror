import SelectModuleDimension from '@/app/components/modules/draft/SelectModuleDimension';
import SelectModuleType from '@/app/components/modules/draft/SelectModuleType';
import useModules from '@/app/hooks/useModules';
import { deleteModule, updateModule } from '@/app/lib/actions';
import { DraftProps } from '@/app/lib/definitions';
import { MicrophoneIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';

export default function UpsertModule({
  draft,
  newModule,
}: {
  draft: DraftProps;
  newModule: boolean;
}) {
  const lastStep = 2;
  const [step, setStep] = useState(1);
  const { setModules } = useModules();

  const handleValidation = () => {
    setStep(step + 1);
    if (step === lastStep) {
      const update = async () => {
        setModules(await updateModule(draft.id, { type: draft.temporaryType }));
      };
      update();
    }
  };

  const handleCancelation = () => {
    if (newModule) {
      const update = async () => {
        setModules(await deleteModule(draft.id));
      };
      update();
    } else {
      const update = async () => {
        setModules(await updateModule(draft.id, { type: draft.temporaryType }));
      };
      update();
    }
  };

  useSpeechRecognition({
    commands: [
      {
        command: ['Validé', 'Valider', 'Sauvegarder', 'Sauvegardé'],
        callback: () => {
          handleValidation();
        },
      },
      {
        command: ['Annuler', 'Annulé'],
        callback: () => {
          handleCancelation();
        },
      },
    ],
  });

  return (
    <div className="flex justify-center items-center h-screen absolute w-full">
      <div
        className="rounded border-2 border-white backdrop-blur-xs bg-black/40"
        style={{ zIndex: 100 }}
      >
        <div className="header p-2">
          <h1 className="text-center">
            {newModule
              ? "Ajout d'un module"
              : `Modification du module ${draft.id}`}
          </h1>
        </div>
        <div className="body p-2">
          {step === 1 && <SelectModuleType draft={draft} />}
          {step === 2 && <SelectModuleDimension draft={draft} />}
        </div>
        <div className="footer block p-2">
          <button
            onClick={handleCancelation}
            className="inline-flex p-1 rounded border-2 border-red-500"
          >
            <MicrophoneIcon className="size-5" /> Annuler
          </button>
          <button
            onClick={handleValidation}
            className="inline-flex p-1 float-right rounded border-2 border-green-500"
          >
            <MicrophoneIcon className="size-5" />{' '}
            {step === lastStep ? 'Sauvegarder' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  );
}
