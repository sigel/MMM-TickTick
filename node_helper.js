const NodeHelper = require("node_helper");
const fs = require("fs");

module.exports = NodeHelper.create({
    start() {
        console.log("MMM-TickTick helper started...");
    },

    async socketNotificationReceived(notification, payload) {
        if (notification === "CONFIG") {
            this.clientId = payload.client_id;
            this.clientSecret = payload.client_secret;
            this.tokenFilePath = payload.tokenFilePath;
            this.loadTokens();
        }
    },

    loadTokens() {
        try {
            const tokens = JSON.parse(fs.readFileSync(this.tokenFilePath));
            this.accessToken = tokens.access_token;
            this.refreshToken = tokens.refresh_token;
            console.log("Tokens loaded successfully.");
        } catch (error) {
            console.error("Failed to load tokens:", error);
        }
    },

});
