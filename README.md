# Quark Client Software

## Building Project

Use this command to create distribution (exe file) and upload it to github.
A fresh setup file is also update to server.
```
> npm run ship
```

To start the project, we can use following command.
```
> npm start
```

## Package file : electron-builder.yml

Before running "npm run ship" to create new release, we need to add new file called "electron-builder.yml" at root of the project.
It contains github token so best to not version it.

The file content looks like this:

appId: "quarkclient"
publish:
  provider: "github"
  token: "7966xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxb766dee9"

## Reference

Good documentation on auto update and shipping.

https://medium.freecodecamp.org/quick-painless-automatic-updates-in-electron-d993d5408b3a