Module.register("MMM-TickTick", {

    defaults: {
        client_id: "TT_CLIENT_ID",
        client_secret: "TT_CLIENT_SECRET",
        tokenFilePath: "token.json", // Path to the token file
        refreshInterval: 5 * 60 * 1000,  // default 5 minutes
        showCompleted: false,
        maxTasks: 10
    },

    start() {
        this.sendSocketNotification("CONFIG", {
            client_id: this.config.client_id,
            client_secret: this.config.client_secret,
            tokenFilePath: this.config.tokenFilePath,
        });
        // ...
    },

});