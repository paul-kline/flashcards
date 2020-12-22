module.exports = {
  globDirectory: "dist/",
  globPatterns: ["**/*.{css,ico,png,svg,html,js,json,txt}", "**/*"],
  swDest: "dist\\service-worker.js",
  directoryIndex: "index.html",
  navigateFallback: "/index.html",
  importScripts: ["./myhook.js"]
  // navigateFallback: "/"
};
