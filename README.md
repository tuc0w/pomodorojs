# pomodorojs
![GitHub](https://img.shields.io/github/license/tuc0w/pomodorojs)

## About
A customizable pomodoro timer for your terminal

---

## Usage
Install the dependencies
```bash
yarn install
# or
npm install
```
Start the timer
```bash
yarn start
# or
npm run start
```

To pause hit the <kbd>p</kbd> key, to resume work hit the <kbd>p</kbd> key again.

To quit and write the logs hit the <kbd>q</kbd> key.

The logs will be saved as a json file within the `logs/` directory, the filename will be the current ISO time, a sample log looks like this:
```json
{
    "task": "Test",
    "targetHours": "3",
    "blockLength": "24",
    "breakLength": "6",
    "timeEntries": [
        [
            {
                "isBreak": false,
                "seconds": 6,
                "start": "2021-02-25T00:04:24.034Z",
                "end": "2021-02-25T00:04:30.360Z"
            },
            {
                "isBreak": true,
                "seconds": 6,
                "start": "2021-02-25T00:04:30.360Z",
                "end": "2021-02-25T00:04:37.031Z"
            }
        ]
    ]
}
```
---
## Credits
Inspired by the article https://js.plainenglish.io/build-a-command-line-pomodoro-timer-in-node-js-65ed2f6d3308
