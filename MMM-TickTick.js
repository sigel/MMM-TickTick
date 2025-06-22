Module.register("MMM-TickTick", {
    defaults: {
        tokenFilePath: "token.json", // Path to the token file
        refreshInterval: 10 * 60 * 1000, // default 10 minutes
        title: "TickTick Tasks", // Title Displayed in Header
        displayHeader: true, // Show TickTick Logo & Title
        displayStyle: "list", // list or rotate
        maxTasks: 10, // Max tasks to show per project
        projects: [ 
			{ name: "My Tasks", pid: "58c5bf923109d118d45725a4" }
		]
    },

    start() {
        console.log("[MMM-TickTick] Module started");
        this.tasks = [];
        this.updateDom();
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
            displayHeader: this.config.displayHeader,
            displayStyle: this.config.displayStyle || "list",
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
            this.sendSocketNotification("TICKTICK_CONFIG", config);
        }
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "TICKTICK_TASKS") {

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

                        const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;

                        const timeString = hasTime ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";

                        if (dateOnly.getTime() === today.getTime()) {
                            formattedDueDate = "Today" + (hasTime ? ` · ${timeString}` : "");
                            dueClass = "today";
                        } else if (dateOnly.getTime() === tomorrow.getTime()) {
                            formattedDueDate = "Tomorrow" + (hasTime ? ` · ${timeString}` : "");
                            dueClass = "tomorrow";
                        } else if (dateOnly < today) {
                            formattedDueDate = "Past Due" + (hasTime ? ` · ${timeString}` : "");
                            dueClass = "past-due";
                        } else {
                            // Anything else in the future
                            formattedDueDate = date.toLocaleDateString(undefined, {
                                weekday: "short",
                                month: "short",
                                day: "numeric"
                            }) + (hasTime ? ` · ${timeString}` : "");
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
            setTimeout(() => {
                this.applyRotate();
            }, 1000);
        }
    },

    applyRotate() {
        const container = document.getElementById("ticktick-project-container");
        if (!container) {
            console.warn("TickTick project container not found");
            return;
        }

        const style = this.config.displayStyle || "list";
        if (style === "list") {
            const projects = container.querySelectorAll(".ticktick-project");
            projects.forEach(p => p.classList.add("active"));
        } else {
            const projects = container.querySelectorAll(".ticktick-project");
            if (projects.length === 0) return;

            let currentIndex = 0;

            function showProject(index) {
                projects.forEach((proj, i) => {
                    if (i === index) {
                        proj.classList.add("active", "fadeIn");
                    } else {
                        proj.classList.remove("active", "fadeIn");
                    }
                });
            }

            showProject(currentIndex);

            if (this.rotateInterval) clearInterval(this.rotateInterval);
            this.rotateInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % projects.length;
                showProject(currentIndex);
            }, 20000);
        }
    }

});
