# MixMHCp_ng

This is the frontend for the MixMHCp web project. It is communicating with the [MixMHCp_backend](https://gitlab.isb-sib.ch/Targetome/MixMHCp_backend).

The code is written in Javascript using the AngularJS framework.

## Prerequisites

- [NodeJS](https://nodejs.org)
- [Bower](https://bower.io)
- [Grunt](https://gruntjs.com)

## Package installation

Call the following bash commands to install the necessary Node modules and Bower components:

```
npm install
bower install
```

## Development server

You can start a development server with Grunt:

```
grunt serve
```

This should automatically open a browser window for `http://localhost:9000/`.
The page will be automatically refreshed when making changes to the code.


## Deployment

To build the frontend application use the following Grunt command:

```
grunt build
```

The folder `dist` will contain the application which has to be copied to a dedicated web-server.



