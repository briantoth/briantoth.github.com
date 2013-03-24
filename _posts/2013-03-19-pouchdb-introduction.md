---
layout: post
title: "PouchDB Introduction"
description: ""
category: Tutorial
tags: [PouchDB, beginner]
tagline: from the beginning
---
{% include JB/setup %}

##Background

PouchDB is a Javascript implementation of CouchDB.  Currently the project is
moving rapidly towards an alpha release, but it is already quite usable for
small projects.  The promise of PouchDB is that it will be the browser-native
member of the Couch family, bringing along with it Javascript queries, JSON
data, and full

When I started working on PouchDB, I was completely unfamiliar with web
technologies.  Although I have learned a bit since then, I still consider
myself to be a novice.  Therefore this guide may seem somewhat simplistic
to those who have significant web experience.  If you fall into this camp,
you should check out the PouchDB introduction here.

I did all of the following on Ubuntu Linux.  The only part that might not
translate to other environments verbatim is the setup of a local server,
but that should not be too challenging to substitute. Enough with the caveats!
On to the content.

## Setting up a simple page

For the purpose of this tutorial we will create a bare-bones HTML page with
a few buttons to expose some of pouch's functions.

    <!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <title>PouchDB Test</title>
    </head>

    <input id="enter-text" placeholder="Enter text here" autofocus>
    <button id="upload">Upload text</button>
    <button id="show">Show all text</button>
    <button id="reset">Reset database</button>

    <div id="display-area"></div>

    <script src="js/pouchdb-nightly.min.js"></script>
    <script src="js/app.js"></script>
    </body>
    </html>

Make a new folder and save the above in it as index.html. You should be 
able to open index.html and see something like this:

![alt text](https://github.com/briantoth/briantoth.github.com/tree/master/assets/images/simple_page_with_buttons.png "HTML page with buttons")

## Adding PouchDB

## Running a local server

##What's next?

In my next post, I will discussing setting up a local instance of CouchDB,
syncing with it, and doing the same with a Couch instance in the cloud.
