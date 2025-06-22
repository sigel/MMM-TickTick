const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = NodeHelper.create({
    start() {
        console.log("[MMM-TickTick] Helper started");
        this.config = null;
        this.accessToken = null;
        this.tokenIssuedAt = null;
        this.fetchInterval = null;
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "TICKTICK_CONFIG") {
            // Make the token file path relative to the module directory
            this.tokenFilePath = path.join(this.path, payload.tokenFilePath);
            this.config = payload;
            
            // Clear any existing interval
            if (this.fetchInterval) {
                clearInterval(this.fetchInterval);
                this.fetchInterval = null;
            }

            this.validateConfig();
            this.loadTokens();
            this.scheduleFetch();
        }
    },

    loadTokens() {
        try {
            if (!fs.existsSync(this.tokenFilePath)) {
                console.error("[MMM-TickTick] Token file not found at:", this.tokenFilePath);
                return;
            }
            const tokens = JSON.parse(fs.readFileSync(this.tokenFilePath));
            this.accessToken = tokens.access_token;
            this.tokenIssuedAt = Date.now();
        } catch (err) {
            console.error("[MMM-TickTick] Error loading tokens:", err.message);
        }
    },

    scheduleFetch() {
        if (!this.config) {
            console.error("[MMM-TickTick] Cannot schedule fetch: configuration not set");
            return;
        }

        // Clear any existing interval
        if (this.fetchInterval) {
            clearInterval(this.fetchInterval);
            this.fetchInterval = null;
        }

        console.log(`[MMM-TickTick] Scheduling task fetch every ${this.config.refreshInterval}ms`);
        
        // Immediate fetch
        console.log("[MMM-TickTick] Performing initial fetch");
        this.fetchTasks();

        // Schedule regular fetches
        this.fetchInterval = setInterval(() => {
            console.log("[MMM-TickTick] Interval triggered - fetching tasks");
            this.fetchTasks();
        }, this.config.refreshInterval);
    },

    async fetchTasks() {
        
        if (!this.accessToken) {
            console.error("[MMM-TickTick] Cannot fetch tasks: No access token available");
            return;
        }

        if (!this.config.projects) {
            console.error("[MMM-TickTick] No Projects Available");
            return;            
        }

        const allTasks = {};

        for (const project of this.config.projects) {
		    const url = `https://api.ticktick.com/open/v1/project/${project.pid}/data`;

            try {
                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                let tasks = response.data.tasks || [];

                // Sort by due date (ascending)
		        tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

                // Save into allTasks grouped by project name
		        allTasks[project.name] = tasks;
                
            } catch (error) {
                console.error(`Failed to fetch tasks for project: ${project.name}`, error.message);
                allTasks[project.name] = [];
            }
	    }

        this.sendSocketNotification("TICKTICK_TASKS", allTasks);

    },

    validateConfig() {
        if (!this.config.tokenFilePath) {
            throw new Error("Token file path is required");
        }
        if (!this.config.refreshInterval || this.config.refreshInterval < 60000) {
            console.warn("[MMM-TickTick] Refresh interval too short, setting to minimum of 1 minute");
            this.config.refreshInterval = 60000;
        }
    }
});
