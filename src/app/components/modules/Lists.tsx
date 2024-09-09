'use client';

import Loader from '@/app/components/Loader';
import { updateModule } from '@/app/lib/actions';
import { ListsProps } from '@/app/lib/definitions';
import { ensure } from '@/app/lib/utils';
import { sentenceCase } from 'change-case';
import { useEffect, useState } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';

interface List {
  listUuid: string;
  name: string;
  theme: string;
  items: Item[];
}

interface Item {
  specification: string;
  name: string;
}

export default function Lists(props: ListsProps) {
  const [loading, setLoading] = useState(true);
  const [displayListOfLists, setDisplayListOfLists] = useState(false);
  const [lists, setLists] = useState<List[]>([]);
  const [currentListUuid, setCurrentListUuid] = useState(
    props.options?.currentListUuid || ''
  );
  const [nbLoadItems, setNbLoadItems] = useState(0);

  useSpeechRecognition({
    commands: [
      {
        command: ['Affiche les listes'],
        callback: () => {
          setDisplayListOfLists(true);
        },
      },
      {
        command: ['Cache les listes'],
        callback: () => {
          setDisplayListOfLists(false);
        },
      },
      {
        command: ['Affiche la liste (des) *'],
        callback: (listName) => {
          const listUuid = getListUuid(listName);
          setCurrentListUuid(listUuid);
          setDisplayListOfLists(false);
          setNbLoadItems(getList(listUuid).items.length);
          updateModule(props.id, { options: { currentListUuid: listUuid } });
        },
      },
      {
        command: [
          "Ajoute (des) (du) (de la) (de l') * (à la liste)",
          'Penser à acheter (des) (du) (de la) *',
        ],
        callback: async (itemName: string) => {
          const name = sentenceCase(itemName);
          await fetch(
            `/api/bring?listUuid=${currentListUuid}&itemName=${name}`,
            {
              method: 'POST',
            }
          );

          setLists(
            lists.map((list) => {
              if (list.listUuid === currentListUuid) {
                return {
                  ...list,
                  items: [...list.items, { name, specification: '' }],
                };
              }
              return list;
            })
          );

          setTimeout(() => setNbLoadItems(nbLoadItems + 1), 100);
        },
      },
      {
        command: ['Retire (les) (le) (la) * (de la liste)'],
        callback: async (itemName: string) => {
          const name = sentenceCase(itemName);
          if (
            getList(currentListUuid).items.find((item) => item.name === name)
          ) {
            await fetch(
              `/api/bring?listUuid=${currentListUuid}&itemName=${name}`,
              {
                method: 'DELETE',
              }
            );

            setLists(
              lists.map((list) => {
                if (list.listUuid === currentListUuid) {
                  return {
                    ...list,
                    items: list.items.filter((item) => item.name !== name),
                  };
                }
                return list;
              })
            );
          }
        },
      },
    ],
  });

  useEffect(() => {
    const fetchAllLists = async () => {
      const response = await fetch(`/api/bring`, {
        method: 'GET',
      });
      const { lists }: { lists: List[] } = await response.json();

      setLists(lists);
      if (!currentListUuid) {
        setCurrentListUuid(lists[0].listUuid);
        return;
      }
      setNbLoadItems(
        ensure(lists.find((list) => list.listUuid === currentListUuid)).items
          .length
      );
      setLoading(false);
    };

    fetchAllLists();
    const interval = setInterval(() => fetchAllLists(), 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loading, currentListUuid]);

  const getList = (listUuid: string): List =>
    ensure(lists.find((list) => list.listUuid === listUuid));

  const getListUuid = (listName: string): string =>
    ensure(
      lists.find((list) => list.name.toLowerCase() === listName.toLowerCase())
    ).listUuid;

  const rightPosFirstColumn = displayListOfLists
    ? `0px`
    : `${(-100 / 12) * props.width}vw`;
  const rightPosSecondColumn = displayListOfLists
    ? `${(100 / 12) * props.width}vw`
    : '0px';

  return (
    <div className="relative size-full px-1">
      {/* <button onClick={handleAdd}>Add Floor</button> */}

      {loading ? (
        <Loader />
      ) : (
        <div className="flex relative size-full">
          <div
            className="size-full absolute transition ease-in-out duration-500"
            style={{ transform: `translateX(${rightPosFirstColumn})` }}
          >
            <ul className="">
              {lists.map((list) => (
                <li key={list.listUuid}>
                  {list.name}{' '}
                  {list.items.length > 0 && (
                    <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-semibold text-black bg-white rounded-full align-[3px]">
                      {list.items.length}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="size-full absolute transition ease-in-out duration-500"
            style={{ transform: `translateX(${rightPosSecondColumn})` }}
          >
            <div className="border-2 mx-auto w-fit px-2 rounded-t-lg bg-slate-600 z-10 relative">
              {getList(currentListUuid).name}
            </div>
            <div className="border-2 h-[calc(100%-1em)] -top-[1em] relative rounded-lg">
              <div className="border h-[inherit] mx-4 my-2 bg-white bg-opacity-10">
                <ul className="px-2 absolute w-[calc(100%-2rem-2px)] top-[7px] overflow-hidden h-[inherit]">
                  {Array.from({ length: 5 * props.height }).map((_, index) => (
                    <li
                      key={index}
                      className="border-b border-dashed border-opacity-50 border-white -mb-px"
                    >
                      &nbsp;
                    </li>
                  ))}
                </ul>
                <ul className="px-2 py-1">
                  {getList(currentListUuid).items.map((item, index) => (
                    <li
                      key={item.name}
                      className={`transition ease-in-out duration-750`} //border-b border-dashed
                      style={{
                        transform: `translateY(${
                          index < nbLoadItems
                            ? '0'
                            : `calc(${(100 / 12) * props.height}vh - ${
                                nbLoadItems * 30
                              }px)`
                        })`,
                      }}
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}