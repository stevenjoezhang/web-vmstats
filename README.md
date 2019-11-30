# Web VMStat

Display live Linux system stats (memory, CPU, IO, etc) in a pretty web-page, with charts and everything.

![Screenshot](https://github.com/joewalnes/web-vmstats/raw/master/screenshot.png)

## Overview

Linux (and many other UNIXy operating systems) have a command line tool called [vmstat](http://en.wikipedia.org/wiki/Vmstat) for monitoring system stats.

It looks like this (a new line is output every second showing the latest values):

    $ vmstat 1
    procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
    r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
    0  0 246784  88976 144640 502132    0    0     9    15   15    6  0  0 99  0  0
    0  0 246784  88984 144640 502132    0    0     0     0   79  155  0  0 100  0  0
    0  0 246784  89488 144640 502132    0    0     0    24   99  229  1  0 99  0  0
    0  0 246784  89504 144640 502132    0    0     0     0   79  168  0  1 99  0  0
    0  0 246784  89504 144640 502132    0    0     0     0   74  163  0  0 100  0  0

Useful, but fugly.

This is a tiny application that streams these stats over a WebSocket using [ws](https://github.com/websockets/ws) and charts them using [SmoothieCharts](http://smoothiecharts.org).

## Why?

Why not? A handy little process to install on machines you care about. After building this for my own needs, I thought it would make a great little demo.

And if you want to use it or hack on it yourself, here it is.

## Credits

Inspired by the original [web-vmstats](https://github.com/joewalnes/web-vmstats) by [Joe Walnes](https://github.com/joewalnes).
