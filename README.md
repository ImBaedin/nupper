# Nupper
#### NodeJS Application Updater

I couldn't find a module that did this so I made one.

`npm install --save nupper`

# Features

  - Automatically update your NodeJS application using a remote resource
  - Automatic from start to right before the restart. (Wanted a lightweight solution, so it's up to you to restart)
  - Automatic dependency install (I think)
  - Some events for your coding pleasure  
  

```
const Nupper = require('nupper');

var settings = {
    repoLocation: 'ImBaedin/autoupdatetest',
    branch: 'master'
};

var nuppyBoi = new Nupper(settings);

nuppyBoi.checkUpdate();

nuppyBoi.on(nuppyBoi.events.OUT_OF_DATE, ()=>{
    nuppyBoi.downloadUpdate();
});

nuppyBoi.on(nuppyBoi.events.DOWNLOAD_COMPLETE, ()=>{
    nuppyBoi.updateFromFile();
});

nuppyBoi.on(nuppyBoi.events.INSTALL_COMPLETE, ()=>{
    console.log('Probably a good idea to restart.');
});
```


## Here are some events, methods and settings

### Events
>`DOWNLOAD_BEGIN` - Fired when download begins.  
>`DOWNLOAD_COMPLETE` - Fired when download is finished.  
>`UP_TO_DATE` - Fired if you check update and you are up to date.  
>`OUT_OF_DATE`- Fired if you check update and you are out of date.  
>`INSTALL_BEGIN` - Fired when install process begins.  
>`INSTALL_COMPLETE` - Fired when install process is finished.  

### Methods
>`nupper.checkUpdate()` - Check remote repo for update.  
>`nupper.downloadUpdate()` - Download the update as a zip.  
>`nupper.updateFromFile(deleteFile: boolean, fileName: string)` - Update from a file.  

### Settings
>`repoLocation` - Location of the repo you are using as a resource.  
>`branch` - The branch you want to use.  
>`jsonHost` - Where raw files are stored. (Default: 'raw.githubusercontent.com')  
>`contentHost` - Where code is stored. (Default 'codeload.github.com')  
>`autoCheck` - If a number, interval to check for updates in ms. (Default: 5000)  
>`tempFileName` - File name of the temporary zip file. (Default: 'UpdateFile.zip')  
>`autoUpdate` - Should the update steps be performed automatically? (Default: false)  
