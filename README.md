# Flight Desktop Client

Web app to provide access to graphical user interface desktops via the
`flight-desktop` tool.

## Overview

Flight Desktop Client is a web application that in conjunction with [Flight
Desktop Server](https://github.com/openflighthpc/flight-desktop-server)
provides access to VNC desktop sessions provided by Flight Desktop over
websockets.  User's can sign in and launch, manage and connect to desktop
sessions.

## Installation

 1. Download a packaged build from
    https://github.com/openflighthpc/flight-desktop-client/releases.  The
    packaged build is named `flight-desktop-client_build_<VERSION>.tar.gz`

 2. Extract the packaged build over `/`.

 3. Edit `/opt/flight/opt/flight-desktop-client/build/config.json` to be
    suitable for your cluster.  In particular, you will likely want to change
    `clusterName` and `apiRootUrl`.

 4. Restart or reload nginx to pick up the new configuration.


# Developing

TBD


# Contributing

Fork the project. Make your feature addition or bug fix. Send a pull
request. Bonus points for topic branches.

Read [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

# Copyright and License

Eclipse Public License 2.0, see [LICENSE.txt](LICENSE.txt) for details.

Copyright (C) 2019-present Alces Flight Ltd.

This program and the accompanying materials are made available under
the terms of the Eclipse Public License 2.0 which is available at
[https://www.eclipse.org/legal/epl-2.0](https://www.eclipse.org/legal/epl-2.0),
or alternative license terms made available by Alces Flight Ltd -
please direct inquiries about licensing to
[licensing@alces-flight.com](mailto:licensing@alces-flight.com).

Flight Desktop Client is distributed in the hope that it will be
useful, but WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER
EXPRESS OR IMPLIED INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OR
CONDITIONS OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY OR FITNESS FOR
A PARTICULAR PURPOSE. See the [Eclipse Public License 2.0](https://opensource.org/licenses/EPL-2.0) for more
details.
