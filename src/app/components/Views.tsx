import ModulesProvider from '@/app/components/context/ModulesContext';
import Modules from '@/app/components/Modules';
import useViews from '@/app/hooks/useViews';
import {
  createView,
  deleteView,
  updateAllViews,
  updateView,
} from '@/app/lib/actions';
import { stringToNumber } from '@/app/lib/utils';
import clsx from 'clsx';
import { useState } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';

export default function Views() {
  const { views, setViews } = useViews();
  const [currentPage, setCurrentPage] = useState(0);
  const viewsPerPage = 4;

  const startIndex = currentPage * viewsPerPage;
  const currentViews = views.slice(startIndex, startIndex + viewsPerPage);
  const maxPage = Math.ceil(views.length / viewsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (startIndex + viewsPerPage < views.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(0);
  };

  const handleLastPage = () => {
    setCurrentPage(maxPage - 1);
  };

  useSpeechRecognition({
    commands: [
      {
        command: [
          'Vues précédentes',
          'Vue précédente',
          'page précédente',
          'précédent',
          'précédente',
        ],
        callback: () => {
          handlePreviousPage();
        },
      },
      {
        command: [
          'Vues suivantes',
          'Vue suivante',
          'page suivante',
          'suivant',
          'suivante',
        ],
        callback: () => {
          handleNextPage();
        },
      },
      {
        command: ['(affiche la) dernière page', '(affiche la) dernière vue'],
        callback: () => {
          handleLastPage();
        },
      },
      {
        command: ['(affiche la) première page', '(affiche la) première vue'],
        callback: () => {
          handleFirstPage();
        },
      },
      {
        command: [
          'montre (moi) la vue :viewName',
          'affiche (moi) la vue :viewName',
        ],
        callback: (viewName: string) => {
          const searchViewIndex = views.findIndex(
            (view) => view.name.toLowerCase() === viewName.toLowerCase()
          );

          setCurrentPage(Math.floor(searchViewIndex / viewsPerPage));
        },
      },
      {
        command: ['Sélectionne (la vue) :viewName'],
        callback: async (viewName: string) => {
          const searchViewIndex = views.findIndex(
            (view) =>
              view.name.toLowerCase() === viewName.toLowerCase() ||
              view.id === stringToNumber(viewName)
          );

          if (views[searchViewIndex]) {
            await updateAllViews({ current: false });
            const updatedViews = await updateView(views[searchViewIndex].id, {
              current: true,
            });

            setViews(updatedViews);
            setCurrentPage(Math.floor(searchViewIndex / viewsPerPage));
          }
        },
      },
      {
        command: ['Ajoute une (nouvelle) vue', 'Nouvelle vue'],
        callback: async () => {
          await updateAllViews({ current: false });
          const updatedViews = await createView({
            current: true,
            modules: [],
            name: 'new view',
          });
          setViews(updatedViews);
          setCurrentPage(maxPage - (views.length % 4 === 0 ? 0 : 1));
        },
      },
      {
        command: ['Renomme la vue (en) :viewName'],
        callback: async (viewName: string) => {
          const selectedView = views.find((view) => view.current);

          if (selectedView) {
            const updatedViews = await updateView(selectedView.id, {
              name: viewName,
            });

            setViews(updatedViews);
          }
        },
      },
      {
        command: ['Supprime la vue', 'Supprime cette vue'],
        callback: async () => {
          if (views.length !== 1) {
            const selectedIndexView = views.findIndex((view) => view.current);
            const nextId =
              selectedIndexView + 1 >= views.length
                ? views[selectedIndexView - 1].id
                : views[selectedIndexView + 1].id;

            if (views[selectedIndexView]) {
              await deleteView(views[selectedIndexView].id);
              const updatedViews = await updateView(nextId, {
                current: true,
              });

              setViews(updatedViews);
            }
          }
        },
      },
    ],
  });

  const btnsClass = clsx('min-w-60');
  const btnPrevClass = clsx(btnsClass, currentPage === 0 && 'invisible');
  const btnNextClass = clsx(
    btnsClass,
    startIndex + viewsPerPage >= views.length && 'invisible'
  );

  return (
    <>
      <div className="flex absolute w-full justify-evenly">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
          className={btnPrevClass}
        >
          Page précédente
        </button>
        <div>
          {currentPage + 1}/{maxPage}
        </div>
        <button
          onClick={handleNextPage}
          disabled={startIndex + viewsPerPage >= views.length}
          className={btnNextClass}
        >
          Page suivante
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8 grid-rows-2 h-full p-8">
        {currentViews.map((view) => (
          <div
            key={view.id}
            className={clsx(
              'view h-full border relative',
              view.current && 'border-4 border-blue-500'
            )}
          >
            <div className="view-name text-center w-full absolute">
              {view.name}
            </div>
            <div className="modules h-full">
              <ModulesProvider initialModules={view.modules}>
                <Modules isEditing={true} displayInView={true} />
              </ModulesProvider>
            </div>
            <div className="view-id text-center -bottom-px -right-px w-6 border absolute">
              {view.id}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
