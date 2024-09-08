'use server';

import { db } from "@/app/lib/db";
import { Module } from "@/app/lib/definitions";
import { ensure } from "@/app/lib/utils";

export async function fetchData() {
  await db.read();
  return db.data;
}

export async function fetchViews() {
  try {
    const { views } = await fetchData();
    return views;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch views data.');
  }
}

export async function fetchCurrentView() {
  try {
    const { views } = await fetchData();
    return ensure(views.find(view => view.current));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch current view data.');
  }
}

export async function fetchModules() {
  try {
    const { modules } = await fetchCurrentView();
    return modules;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch modules data.');
  }
}

export async function fetchModule(id: number): Promise<Module> {
  try {
    const { modules } = await fetchCurrentView();
    return ensure(modules.find((module) => module.id === id));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch module data.');
  }
}