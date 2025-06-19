Module.register("MMM-TickTick", {
    defaults: {
        tokenFilePath: "token.json", // Path to the token file
        refreshInterval: 10 * 60 * 1000, // default 10 minutes
        title: "TickTick Tasks",
        displayStyle: "list", // list or rotate
        maxTasks: 10,
        projects: [ 
			{ name: "My Tasks", pid: "58c5bf923109d118d45725a4" }
		]
    },

    start() {
        console.log("[MMM-TickTick] Module started");
        this.tasks = [];
        this.updateDom();
    },

    getScripts() {
        return [];
    },

    getStyles() {
        return ["MMM-TickTick.css"];
    },

    getTemplate() {
	    return "templates/default.njk";
    },

    getTemplateData() {
        return {
            title: this.config.title,
            tasksByProject: this.tasks || {}
        };
    },

    requiresVersion: "2.2.0",

    notificationReceived(notification, payload, sender) {
        if (notification === "DOM_OBJECTS_CREATED") {
            const config = {
                tokenFilePath: this.config.tokenFilePath,
                refreshInterval: this.config.refreshInterval,
                maxTasks: this.config.maxTasks,
                projects: this.config.projects
            };
            this.sendSocketNotification("CONFIG", config);
        }
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "TICKTICK_TASKS") {
            console.log("[MMM-TickTick] Received tasks:", payload);

            const formatted = {};
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            for (const [project, tasks] of Object.entries(payload)) {
                formatted[project] = tasks.map(task => {
                    let formattedDueDate = null;
                    let dueClass = null;

                    if (task.dueDate) {
                        const date = new Date(task.dueDate);
                        const dateOnly = new Date(date);
                        dateOnly.setHours(0, 0, 0, 0);

                        if (dateOnly.getTime() === today.getTime()) {
                            formattedDueDate = "Today";
                            dueClass = "today";
                        } else if (dateOnly.getTime() === tomorrow.getTime()) {
                            formattedDueDate = "Tomorrow";
                            dueClass = "tomorrow";
                        } else if (dateOnly < today) {
                            formattedDueDate = "Past Due";
                            dueClass = "past-due";
                        } else {
                            // Anything else in the future
                            formattedDueDate = date.toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                            });
                            dueClass = "normal";
                        }
                    }

                    return {
                        ...task,
                        formattedDueDate,
                        dueClass
                    };
                });
            }


            this.tasks = formatted;
            this.updateDom();
        }
    },

});
