// apps/home/index.ts
//
// The starting point of the Griho Home app. The phone runs this file first.
// It simply hands the main screen (App.tsx) to Expo, the tool that runs the app.

import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);
