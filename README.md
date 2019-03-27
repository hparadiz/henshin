Henshin is a Slack bot written in NodeJS designed to allow you to rapidly build bot commands with modern well structured JavaScript.

### Getting Started
1. Clone this repo.
2. `cp config/default.env.js config/env.js`
3. Fill in your Slack Application Tokens from the Slack website
4. Run ./bin/henshin from terminal

### How to Get Slack Tokens
1. Go to **<https://api.slack.com/apps>** and click **Create New App**. Select your workspace and give your new app a name.
2. Go to **OAuth & Permissions**.

    Add these permission scopes:
    - channels:history
    - channels:read
    - channels:write
    - chat:write:bot
    - chat:write:user
    - groups:history
    - groups:read
    - groups:write
    - im:history
    - im:read
    - im:write
    - links:read
    - links:write
    - mpim:history
    - mpim:read
    - mpim:write
    - users.profile:read
    - users:read
    - emoji:read
    - files:write:user
3. Readd the application to your Slack instance.
4. Go back to  **OAuth & Permissions** to get your `HUBOT_SLACK_TOKEN` and `HUBOT_SLACK_OAUTH_ACCESS_TOKEN` and fill the values in.
5. Go to **Incoming Webhooks** and click "Add New Webhook to Workspace". Copy the webhook that was created for you to `HUBOT_SLACK_INCOMING_WEBOOK`

### License

Henshin is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT)
