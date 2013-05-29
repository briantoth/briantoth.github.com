---
layout: post
title: "PouchDB Replication"
description: ""
category: tutorial
permalink: /Tutorial/2013/04/07/pouchdb-replication/
tags: [PouchDB, intermediate, replication]
---
{% include JB/setup %}

##Introduction

This tutorial is intended to explain syncing your PouchDB instances with CouchDB.  I will be
working with the code found in my [previous tutorial]({% post_url 2013-03-19-pouchdb-introduction %}),
so I recommend reading that post first.

One of the most exciting features of PouchDB is the ability to keep a lot of data on a client machine
without much effort.  However, at some point, you'll want to back up, modify, or otherwise access
that data remotely.  We can sync with another database using `Pouch.replicate`.

##Setting up CouchDB locally

I find it tremendously useful to have a local database to work with when developing.  Although there is
always a risk that the production database will differ in some small ways from the development database,
keeping your data separate is more than worth the hassle. Unfortunately, many package mangers have
an antiquated version of CouchDB (Ubuntu especially).  Unless your package manager has CouchDB 1.2.0+,
I recommend using [build-couchdb](https://github.com/iriscouch/build-couchdb) to get a local CouchDB server.

Go ahead and run your server once you get it set up.

At this point it is probably a good idea to get an idea of how to work with CouchDB if you aren't already familiar
with it.  I found [moonmaster9000's introduction](https://github.com/moonmaster9000/intro_to_couchdb) to be very helpful.

###CORS proxy

In order to access your database from another domain, you will need a proxy.
Once again, I will defer to someone else who
has already figured this out.  From [Ben's blog](http://pennyhacks.com/2013/01/28/setting-up-pouchdb-with-couchdb/):

    npm install -g corsproxy
    corsproxy

To test that it is working, navigate to `http://localhost:9292/localhost:5984`
while the CouchDB server is running.

##Adding replication to an application

Let's revisit our application from the first tutorial and add push and pull functionality.
Add the following functions to `app.js`:

    {% highlight js %}
    var push= function(){
        Pouch.replicate('idb://pouch_intro', 'http://localhost:9292/localhost:5984/pouch_intro',
        function(err,resp){
            if(err){
                alert("Push failed!")
            }
        })
    };

    var pull= function(){
        Pouch.replicate('http://localhost:9292/localhost:5984/pouch_intro', 'idb://pouch_intro',
        function(err,resp){
            if(err){
                alert("Pull failed!")
            }
        })
    };
    {% endhighlight %}

There really isn't much to it.  `Pouch.replicate` takes care of all of the heavy lifting.  The first argument is
the place to get updates from, and the second is the place to apply those changes.  We also need some more
buttons in `index.html`.

    {% highlight html %}
    <button id="push">Push to remote database</button>
    <button id="pull">Pull from remote database</button>
    {% endhighlight %}

And the listeners for those buttons in `app.js`.

    {% highlight js %}
    function addEventListeners() {
        //Hook in to various parts of the page
        ...
        document.getElementById('push').addEventListener( 'click', push, false);
        document.getElementById('pull').addEventListener( 'click', pull, false);
    };
    {% endhighlight %}

Go ahead and try it out.  Even if you haven't created any databases on CouchDB yet, they
will automatically be generated as necessary.  Note that if you pull from Couch, make changes, and pull
again, your changes in Pouch will not be overwritten.  The details of CouchDB conflict resolution are
beyond the scope of this tutorial, but you can learn more [from the definitive guide](http://guide.couchdb.org/draft/conflicts.html).

You can also add documents directly to CouchDB.  Do the following and then pull the changes.

    export HOST="http://localhost:5984"
    curl -v -H "Content-Type:application/json" -X POST $HOST/pouch_intro -d '{"text":"hello world"}'

##Controlling what gets replicated

Chances are, you don't want to dump all of your data to the client every time a pull is issued.  Fortunately,
replicate has a filter option.  We will change our pull function to only get documents that have a specific
property.

    {% highlight js %}
    var pull= function(){
        var filter= function(doc){
            return doc.pullAble;
        }
        Pouch.replicate('http://localhost:9292/localhost:5984/pouch_intro', 'idb://pouch_intro',
                        {filter : filter},
                        function(err,resp){
            if(err){
                alert("Pull failed!")
            }
        })
    };
    {% endhighlight %}

Now if you reset Pouch's database and pull, nothing will be replicated locally (even though we put some docs
into CouchDB in previous steps).  Add another doc to your database which will pass the filter:

    curl -v -H "Content-Type:application/json" -X POST $HOST/pouch_intro -d' {"text":"good day", "pullAble":"yes"}'

Now a pull returns the above document.  Filters also work the other way; you can limit what gets pushed
from your PouchDB instances.

##What's next?

All of the code in this post can be found [here](https://github.com/briantoth/briantoth.github.com/tree/master/assets/code/pouchdb_replication).


Originally, this post was going to include a walkthrough for syncing with a cloud database.  This has proven
to be a little trickier than I anticipated to set up, so I will defer it to the next post.  CouchDB 1.3
promises to make this much easier with baked-in support for CORS.  Another way around the problem is avoiding
the 'Cross-origin' part altogether and serving something called a [CouchApp](http://couchapp.org/page/what-is-couchapp).

After that will be a shameless advertisement for the GQL plugin I wrote for PouchDB.  There is a lot more
to say about replication though, and this is an active area of development.  I recommend going straight
to [the api](http://pouchdb.com/api.html#replicate_a_database) to learn about `db.revDiffs` and
`db.changes`.
