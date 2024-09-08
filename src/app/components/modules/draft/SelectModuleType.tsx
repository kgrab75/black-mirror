'use client';
import 'regenerator-runtime/runtime';

import useModules from '@/app/hooks/useModules';
import useNotification from '@/app/hooks/useNotification';
import { updateModule } from '@/app/lib/actions';
import { Module } from '@/app/lib/definitions';
import { label2type, labelExists, moduleDetails } from '@/app/lib/utils';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSpeechRecognition } from 'react-speech-recognition';

export default function SelectModuleType({ draft }: { draft: Module }) {
  const { showNotification } = useNotification();
  const { setModules } = useModules();

  useSpeechRecognition({
    commands: [
      {
        command: ['(Ajoute) le module *', '(Rajoute) le module *', 'Module *'],
        callback: (moduleLabel) => {
          return selectModuleFromLabel(moduleLabel);
        },
      },
    ],
  });

  const onModuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const type = e.target.value;
    selectModule(type);
  };

  const moduleDetailsWithoutDraft = moduleDetails.filter(
    (moduleDetail) => moduleDetail.type !== 'Draft'
  );

  return (
    <>
      {moduleDetailsWithoutDraft.map((module) => (
        <div key={`module-${module.type}`} className="h-8">
          <input
            type="radio"
            name="module"
            id={module.type}
            value={module.type}
            checked={draft.temporaryType === module.type}
            onChange={onModuleChange}
          />
          <label htmlFor={module.type}>
            <span className="inline-flex">
              <FontAwesomeIcon icon={faMicrophone} />
              <div className="mx-1">Module {module.labels[0]} </div>
              <FontAwesomeIcon icon={module.icon} />
            </span>
          </label>
        </div>
      ))}
    </>
  );

  function selectModuleFromLabel(moduleLabel: string) {
    if (labelExists(moduleLabel)) {
      selectModule(label2type(moduleLabel));
    } else {
      showNotification(`Le module ${moduleLabel} n'existe pas`);
    }
  }

  function selectModule(moduleType: string) {
    const update = async () => {
      setModules(await updateModule(draft.id, { temporaryType: moduleType }));
    };
    update();
  }
}
