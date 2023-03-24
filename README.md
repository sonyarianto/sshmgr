<a href="https://paypal.me/sonyarianto?country.x=ID&locale.x=en_US" target="_blank">
 <img alt="Sponsor" src="https://img.shields.io/badge/donate-Paypal-fd8200.svg" />
</a>
<a href="https://discord.com/channels/1083266930896535562/1088644871407018055" target="_blank">
  <img alt="Discord" src="https://img.shields.io/discord/1083266930896535562">
</a>

# sshmgr
Simple SSH manager for busy and lazy people.

## Overview

If you have many servers to manage, you can use this tool to manage. You can add, remove, edit, and list your servers. You can also login to your server by using this tool. It can be handy if you are a freelancer, DevOps, or anyone that need to handle multiple servers.

> This tool not save your password, it only save your private key location. If your server require password, you have to type it every time you login.

## Features

- Add, remove, edit, and list your servers.

## Installation

Install it globally.

```
npm i -g sshmgr
```

now you can call it by type `sshmgr` on your computer.

## Screenshot

![sshmgr](https://github.com/sonyarianto/sshmgr/blob/main/sshmgr-0.2.0.jpg?raw=true&39283)

> 🔑 require private key to login, 🔒 require password to login

## Technical notes

- Config file stored on `$HOME` directory on a file called `.sshmgr.config.json`. It will automatically created when not exists.

## License

MIT

Copyright &copy; 2023 Sony Arianto Kurniawan <<sony@sony-ak.com>> and contributors.
