// This file loads the unbuilt ES6 version of Cesium
// into the global scope during local development
window.CESIUM_BASE_URL = "../../../Build/CesiumUnminified/";
import * as Cesium from "../../Build/CesiumUnminified/index.js";
window.Cesium = Cesium;
Cesium.Ion.defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwYjZkZTViOC0xN2E5LTRlMDctOTcxOS04YjU1N2NjMjljOTkiLCJpZCI6MTM0NzcsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjMzNTM5ODB9.RGY9YEPoZFxqKWq-mUb5Yu8QWnRBlnqsvpC-eEKxGDc';

// Since ES6 modules have no guaranteed load order,
// only call startup if it's already defined but hasn't been called yet
if (!window.startupCalled && typeof window.startup === "function") {
  window.startup(Cesium).catch((error) => {
    console.error(error);
  });
  Sandcastle.finishedLoading();
}
