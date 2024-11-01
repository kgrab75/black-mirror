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
import useNightMode from '@/app/hooks/useNightMode';
import useNotification from '@/app/hooks/useNotification';
import useViews from '@/app/hooks/useViews';
import { getDraftModule, stringToNumber } from '@/app/lib/utils';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import { convertToSeconds } from '../lib/utils/date';
import LoadingBar from './LoadingBar';

export default function Modules({
  isEditing,
  displayInView,
}: {
  isEditing: boolean;
  displayInView: boolean;
}) {
  const defaultLoadingBarDuration = 30;
  const { modules, setModules } = useModules();
  const { views, setViews } = useViews();
  const [newModule, setNewModule] = useState(false);
  const [displayLoadingBar, setDisplayLoadingBar] = useState(false);
  const [durationLoadingBar, setDurationLoadingBar] = useState(
    defaultLoadingBarDuration,
  );
  const [displayCreateModule, setDisplayCreateModule] = useState(false);
  const draftModule = getDraftModule(modules);
  const { showNotification } = useNotification();
  const { nightMode, setNightMode, setManualOverride } = useNightMode(
    '00:00:00',
    '06:30:00',
  );

  useEffect(() => {
    setDisplayCreateModule(draftModule !== null);
  }, [modules, draftModule]);

  const defaultCommands = [
    {
      command: [
        'Affiche la vue :viewName',
        'vue :viewName',
        'vu :viewName',
        'vu :viewName pendant *',
        'vue :viewName pendant *',
      ],
      callback: async (
        viewName: string,
        duration: { command: string } | string,
      ) => {
        const searchViewIndex = views.findIndex(
          (view) => view.name.toLowerCase() === viewName.toLowerCase(),
        );
        const defaultViewIndex = views.findIndex((view) => view.current);

        if (views[searchViewIndex]) {
          const durationInSecond =
            typeof duration === 'string'
              ? convertToSeconds(duration) || defaultLoadingBarDuration
              : defaultLoadingBarDuration;

          setDurationLoadingBar(durationInSecond);
          setDisplayLoadingBar(true);
          setModules(views[searchViewIndex].modules);
          setTimeout(() => {
            setModules(views[defaultViewIndex].modules);
            setDisplayLoadingBar(false);
          }, durationInSecond * 1000);
        }
      },
    },
    {
      command: 'Mode nuit',
      callback: () => {
        setNightMode(true);
        setManualOverride(true);
      },
    },
    {
      command: 'Mode jour',
      callback: () => {
        setNightMode(false);
        setManualOverride(true);
      },
    },
  ];

  const editModeCommands = [
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
            }),
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
          `Dis "supprimer" pour confirmer la suppresion du module ${id}. Sinon, dis "annuler"`,
        );
        setModules(
          await updateModule(stringToNumber(id), {
            isPendingDeletion: true,
          }),
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
            }),
          );
        }
      },
    },
  ];

  useSpeechRecognition({
    commands: isEditing
      ? [...defaultCommands, ...editModeCommands]
      : defaultCommands,
  });

  SpeechRecognition.startListening({ continuous: true });

  return (
    <>
      {displayLoadingBar && <LoadingBar duration={durationLoadingBar} />}
      <div className={clsx('modules-container', nightMode && 'opacity-15')}>
        {draftModule && displayCreateModule && (
          <UpsertModule draft={draftModule} newModule={newModule} />
        )}
        {modules.map((module) => {
          return (
            module.display && (
              <Module
                key={`${module.type}-${module.id}`}
                {...module}
                isEditing={isEditing}
                displayInView={displayInView}
              />
            )
          );
        })}
      </div>
    </>
  );
}
