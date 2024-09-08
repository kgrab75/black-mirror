'use server'

import { db } from "@/app/lib/db";
import { NewModule, NewView, View } from "@/app/lib/definitions";
import { ensure } from "@/app/lib/utils";
import { fetchData } from "./data";

const getModulesFromCurrentView = (views: View[]) => ensure(views.find(view => view.current)).modules

export async function createModule(newModuleData: NewModule) {
  try {
    const { views } = await fetchData();
    const modules = getModulesFromCurrentView(views);
    const maxId = modules.reduce((max, module) => Math.max(max, module.id), 0);
    const nextId = maxId + 1;

    await db.update((data) => getModulesFromCurrentView(data.views).push({ ...newModuleData, id: nextId }));

    return modules;
  } catch (error) {
    throw new Error(`Database Error: Failed to Create Module. ${error}`);
  }
}

export async function updateModule(id: number, dataToUpdate: Partial<NewModule>) {
  try {
    await db.update((data) => { ensure(data.views.find(view => view.current)).modules = getModulesFromCurrentView(data.views).map(module => module.id === id ? { ...module, ...dataToUpdate } : module) });

    return getModulesFromCurrentView(db.data.views);
  } catch (error) {
    throw new Error('Database Error: Failed to Update Module.');
  }
}

export async function updateAllModules(dataToUpdate: Partial<NewModule>) {
  try {
    await db.update((data) => { ensure(data.views.find(view => view.current)).modules = getModulesFromCurrentView(data.views).map(module => ({ ...module, ...dataToUpdate })) });

    return getModulesFromCurrentView(db.data.views);
  } catch (error) {
    throw new Error('Database Error: Failed to Update Module.');
  }
}

export async function deleteModule(id: number) {
  try {
    const modules = getModulesFromCurrentView(db.data.views);

    await db.update((data) => getModulesFromCurrentView(data.views).filter((module, index, arr) => {
      if (module.id === id) {
        arr.splice(index, 1);
        return true;
      }
      return false;
    }));

    return modules;
  } catch (error) {
    throw new Error('Database Error: Failed to Delete Module.');
  }
}

export async function deleteIsPendingDeletionModules() {
  try {
    const modules = getModulesFromCurrentView(db.data.views);

    const newModulesSet = modules.filter(module => !module.isPendingDeletion);

    await db.update((data) => { ensure(data.views.find(view => view.current)).modules = newModulesSet });

    return newModulesSet;
  } catch (error) {
    throw new Error('Database Error: Failed to Delete IsPendingDeletion Modules.');
  }
}

export async function createView(newViewData: NewView) {
  try {
    const { views } = await fetchData();
    const maxId = views.reduce((max, view) => Math.max(max, view.id), 0);
    const nextId = maxId + 1;

    await db.update((data) => data.views.push({ ...newViewData, id: nextId }));

    return views;
  } catch (error) {
    throw new Error('Database Error: Failed to Create View.');
  }
}

export async function updateAllViews(datatoUpdate: Partial<View>) {
  try {
    await db.update((data) => { data.views = data.views.map(view => ({ ...view, ...datatoUpdate })) });

    return db.data.views;
  } catch (error) {
    throw new Error('Database Error: Failed to Update Views.');
  }
}

export async function updateView(id: number, dataToUpdate: Partial<View>) {
  try {
    await db.update((data) => { data.views = data.views.map(view => view.id === id ? { ...view, ...dataToUpdate } : view) });

    return db.data.views;
  } catch (error) {
    throw new Error('Database Error: Failed to Update View.');
  }
}

export async function deleteView(id: number) {
  try {
    const { views } = await fetchData();

    await db.update((data) => data.views.filter((view, index, arr) => {
      if (view.id === id) {
        arr.splice(index, 1);
        return true;
      }
      return false;
    }));

    return views;
  } catch (error) {
    throw new Error('Database Error: Failed to Delete View.');
  }
}