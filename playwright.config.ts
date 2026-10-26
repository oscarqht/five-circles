import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/browser',timeout:45000,fullyParallel:false,
  use:{baseURL:'http://localhost:5173',channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true},
  projects:[{name:'desktop',use:{viewport:{width:1440,height:1000}}},{name:'phone',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2}}],
});
