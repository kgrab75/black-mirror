'use client';

import {
  createModule,
  deleteIsPendingDeletionModules,
  updateAllModules,
  updateModule,
} from '@/app//lib/actions';
import Module from '@/app/components/Module';
import UpsertModule from '@/app/components/UpsertModule';
import useModules from '@/app/hooks/useModules';
import useNotification from '@/app/hooks/useNotification';
import useViews from '@/app/hooks/useViews';
import { Module as ModuleType } from '@/app/lib/definitions';
import { getDraftModule, stringToNumber } from '@/app/lib/utils';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';

export default function Modules({
  isEditing,
  displayInView,
}: {
  isEditing: boolean;
  displayInView: boolean;
}) {
  const { modules, setModules } = useModules();
  const { views } = useViews();
  const [newModule, setNewModule] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [displayCreateModule, setDisplayCreateModule] = useState(false);
  const draftModule = getDraftModule(modules);
  const { showNotification } = useNotification();

  useEffect(() => {
    setDisplayCreateModule(draftModule !== null);
  }, [modules, draftModule]);

  const commands = [
    {
      command: ['Nouveau module', 'Rajoute un (nouveau) module'],
      callback: async () => {
        const draftModule = getDraftModule(modules);

        if (draftModule) {
          if (!draftModule.visible) {
            setModules(await updateModule(draftModule.id, { visible: true }));
          }
        } else {
          setModules(
            await createModule({
              type: 'Draft',
              posX: 5,
              posY: 5,
              width: 4,
              height: 2,
              visible: true,
              display: true,
              temporaryType: 'Draft',
              options: {},
            })
          );
        }

        setDisplayCreateModule(true);
        setNewModule(true);
      },
    },
    {
      command: [
        'Modifie le module :id',
        'Change le module :id',
        'Update le module :id',
      ],
      callback: async (id: number) => {
        if (!getDraftModule(modules)) {
          setModules(await updateModule(stringToNumber(id), { type: 'Draft' }));

          setDisplayCreateModule(true);
          setNewModule(false);
        }
      },
    },
    {
      command: [
        'Supprime le module :id',
        'Retire le module :id',
        'Efface le module :id',
      ],
      callback: async (id: number) => {
        showNotification(
          `Dis "supprimer" pour confirmer la suppresion du module ${id}. Sinon, dis "annuler"`
        );
        setModules(
          await updateModule(stringToNumber(id), {
            isPendingDeletion: true,
          })
        );
      },
    },
    {
      command: 'Supprimer',
      callback: async () => {
        if (modules.filter((module) => module.isPendingDeletion).length > 0) {
          setModules(await deleteIsPendingDeletionModules());
        }
      },
    },
    {
      command: 'Annuler',
      callback: async () => {
        if (modules.filter((module) => module.isPendingDeletion).length > 0) {
          setModules(
            await updateAllModules({
              isPendingDeletion: false,
            })
          );
        }
      },
    },
    {
      command: 'Mode nuit',
      callback: () => setNightMode(true),
    },
    {
      command: 'Mode jour',
      callback: () => setNightMode(false),
    },
    {
      command: ['Affiche la vue :viewName'],
      callback: async (viewName: string) => {
        const selectedView = views.find(
          (view) => view.name.toLowerCase() === viewName.toLowerCase()
        );

        if (selectedView) {
          setModules(selectedView.modules);
        }
      },
    },
  ];

  useSpeechRecognition({
    commands: isEditing ? commands : [],
  });

  SpeechRecognition.startListening({ continuous: true });

  type TypeCounts = {
    [key: string]: number;
  };

  const typeCounts: TypeCounts = modules.reduce(
    (acc: TypeCounts, module: ModuleType) => {
      if (module.visible) {
        acc[module.type] = (acc[module.type] || 0) + 1;
      }
      return acc;
    },
    {}
  );

  return (
    <>
      <div
        className={clsx(
          'modules-container',
          process.env.NODE_ENV !== 'production' &&
            '!w-[1080px] !h-[1920px] border border-white',
          nightMode && 'opacity-15'
        )}
      >
        {draftModule && displayCreateModule && (
          <UpsertModule draft={draftModule} newModule={newModule} />
        )}
        {modules.map((module) => {
          return (
            module.display && (
              <Module
                key={module.id}
                {...module}
                isEditing={isEditing}
                isUniq={typeCounts[module.type] === 1}
                displayInView={displayInView}
              />
            )
          );
        })}
      </div>
    </>
  );
}
