# MMM-TickTick

MagicMirror² module to display tasks from TickTick.

# Screenshots

![Example of MMM-TickTick](https://i.imgur.com/yy04oxB.jpeg)
![Authentication](https://i.imgur.com/LF2sLos.jpeg)

## Installation

### Install

In your terminal, go to your [MagicMirror²][mm] Module folder and clone MMM-TickTick:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/sigel/MMM-TickTick.git
cd MMM-TickTick
npm install
```
### First Run (Get Authentication Token)

```bash
npm run auth
```
Follow instructions.

### Update

```bash
cd ~/MagicMirror/modules/MMM-TickTick
git pull
```

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:

```js
    {
        module: 'MMM-TickTick',
        position: 'top_left',
        config {
            refreshInterval: 10 * 60 * 1000, // default 10 minutes
            title: "TickTick Tasks", // Title Displayed in Header
            displayHeader: true, // Show TickTick Logo & Title
            displayStyle: "list", // list or rotate
            maxTasks: 10, // Max tasks to show per project
            projects: [
                { name: "My Tasks", pid: "58c5bf923109d118d45725a4" },
                { name: "Shopping", pid: "31a5bf923109d118d45725a4" }
            ]
        }
    },
```

How to find Project ID's in TickTick Webapp:

![How to find project id](https://i.imgur.com/yf2ZAO8.jpeg)

## Configuration options

Option|Possible values|Default|Description
------|------|------|-----------
`refreshInterval`|`number`|10 * 60 * 1000|Fetch tasks every 10 minutes
`title`|`string`|TickTick Tasks|Title to show in header
`displayHeader`|`boolean`|true|Show module header with TickTick logo and title
`displayStyle`|`string`|list|'list' to show all or 'rotate' to fade between projects
`maxTasks`|`number`|10|max tasks to show per project
`projects`|`array`||List project ids and preferred name of each project

[mm]: https://github.com/MagicMirrorOrg/MagicMirror