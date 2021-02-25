const fs = require("fs");
const readline = require("readline");
const { Form, Input, Select } = require("enquirer");
const _colors = require("colors");
const cliProgress = require("cli-progress");
var TimeFormat = require("hh-mm-ss");
const path = require("path");

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

class Pomodoro {
    constructor(task, { _target, _block, _break }) {
        this.block = _block;
        this.break = _break;
        this.isBreak = false;
        this.logs = [];
        this.seconds = 0;
        this.start = new Date().toISOString();
        this.target = _target;
        this.task = task;
        this.timer = null;
        this.total = 0;

        const multibar = new cliProgress.MultiBar({
            format: `{type} [${_colors.green("{bar}")}] {progress}`,
            barCompleteChar: "\u2588",
            barIncompleteChar: "\u2591",
            hideCursor: true,
        });

        this.blockBar = multibar.create(parseInt(_block) * 60, 0);
        this.totalBar = multibar.create(parseFloat(_target) * 60 * 60, 0);
        this.breakBar = multibar.create(parseInt(_break) * 60, 0);
    }

    run() {
        this.timer = setInterval(() => {
            if (this.isBreak) {
                this.seconds++;
                this.breakBar.update(Math.round(this.seconds), {
                    type: "break",
                    progress: TimeFormat.fromS(this.break * 60 - this.seconds) + " until next work block",
                });
                this.blockBar.update(0, { type: "block", progress: "breaking" });
            } else {
                this.seconds++;
                this.total++;
                this.totalBar.update(Math.round(this.total), {
                    type: "total",
                    progress: TimeFormat.fromS(this.total, "hh:mm:ss") + ` / ${this.target} Hours`,
                });
                this.blockBar.update(Math.round(this.seconds), {
                    type: "block",
                    progress: TimeFormat.fromS(this.block * 60 - this.seconds) + " until next break",
                });
                this.breakBar.update(0, { type: "break", progress: "working" });
            }
        }, 1000);
    }

    toggle() {
        const end = new Date().toISOString();
        this.logs = [
            ...this.logs,
            {
                isBreak: this.isBreak,
                seconds: this.seconds,
                start: this.start,
                end,
            },
        ];
        this.start = end;
        this.isBreak = !this.isBreak;
        this.seconds = 0;
        this.breakBar.update(0);
    }

    finish() {
        const end = new Date().toISOString();
        this.logs = [
            ...this.logs,
            {
                isBreak: this.isBreak,
                seconds: this.seconds,
                start: this.start,
                end,
            },
        ];

        this.start = end;
        let log = {
            "task": this.task,
            "targetHours": this.target,
            "blockLength": this.block,
            "breakLength": this.break,
            "timeEntries": [
                this.logs
            ]
        };

        fs.writeFileSync(
            path.join(__dirname, "..", "logs", new Date().toISOString().replace(/:/g, "-") + ".json"),
            JSON.stringify(log, null, 4)
        );
    }
}

const taskInputType = new Select({
    name: "taskInputType",
    message: "How would you like to select the task to work on?",
    choices: ["Custom", "Select", "None"],
});

const taskInput = new Input({
    name: "taskInput",
    message: "What task are you going to work on?",
});

const taskSelect = new Select({
    name: "taskSelect",
    message: "What task are you going to work on?",
    choices: ["Coding", "Debugging", "DevOps", "Organisation", "Planning"],
});

const timePrompt = new Form({
    name: "user",
    message: "Please edit your time config:",
    choices: [
        { name: "_target", message: "Total Length (h)", initial: "3" },
        { name: "_block", message: "Block Length (m)", initial: "24" },
        { name: "_break", message: "Break Length (m)", initial: "6" },
    ],
});

taskInputType
    .run()
    .then(taskInputType => {
        var task = "";

        switch (taskInputType) {
            case "Custom":
                task = taskInput.run();
                break;
            case "Select":
                task = taskSelect.run();
                break;
            case "None":
            default:
                break;
        }

        return task;
    })
    .then(task => {
        timePrompt
            .run()
            .then(hours => {
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });

                let pomodoro = new Pomodoro(task, hours);

                process.stdin.on("keypress", char => {
                    if (char === "p") {
                        pomodoro.toggle();
                    } else if (char === "q") {
                        pomodoro.finish();
                        process.exit(0);
                    }
                });

                process.on("beforeExit", () => {
                    pomodoro.finish();
                });

                pomodoro.run();
            })
            .catch(console.error);
    })
    .catch(console.error);
