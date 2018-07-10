# Nupper
#### NodeJS Application Updater

I couldn't find a module that did this so I made one.

`npm install --save nupper`

# Features

  - Automatically update your NodeJS application using a remote resource
  - Automatic from start to right before the restart. (Wanted a lightweight solution, so it's up to you to restart)
  - Automatic dependecy install (I think)
  - Some events for your coding pleasure  
  

```
const Nupper = require('nupper');

var settings = {
    repoLocation: 'ImBaedin/autoupdatetest',
    branch: 'master'
};

var nuppyBoi = new Nupper(settings);

nuppyBoi.checkUpdate();

nupBoi.on(nupBoi.events.OUT_OF_DATE, ()=>{
    nuppyBoi.downloadUpdate();
});

nupBoi.on(nupBoi.events.DOWNLOAD_COMPLETE, ()=>{
    nuppyBoi.updateFromFile();
});

nupBoi.on(nupBoi.events.INSTALL_COMPLETE, ()=>{
    console.log('Probably a good idea to restart.');
});
```
