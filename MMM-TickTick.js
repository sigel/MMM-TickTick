Module.register("MMM-TickTick", {
    defaults: {
        tokenFilePath: "token.json", // Path to the token file
        refreshInterval: 10 * 60 * 1000, // default 10 minutes
        title: "TickTick Tasks",
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
            this.tasks = payload;
            this.updateDom();
        }
    },

});
