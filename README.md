![Logo](docs/img/logo.png "Logo")

Application Bot
---

> A discord that utilizes message collectors to conduct application interviews with users,
> and post their completed application in a specified channel

What It Does
---

- [x] Asks users application related questions via DM
- [x] Records and posts application results in a configurable channel
- [x] Alerts a configurable role when applications are submitted
 
Usage Overview
---
 
When a user reacts to a specific message, it will trigger the bot to open a DM and send a series of
questions to the user, and collecting their answers. Upon completing all questions, the bot will insert
the collected message into a specified channel, tagging the user and recruiters.

#### `.env`

```
NODE_ENV=
SENTRY_DSN=
BOT_TOKEN=
TRIGGER_MESSAGE_ID=
OUTPUT_CHANNEL_ID=
ALERT_ROLE_ID=
```
