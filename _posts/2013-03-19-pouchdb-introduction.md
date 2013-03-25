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
member of the CouchDB family, bringing along with it Javascript queries, JSON
data, and the ability to replicate with any other database in the Couch
universe.

When I started working on PouchDB, I was completely unfamiliar with web
technologies.  Although I have learned a bit since then, I still consider
myself to be a novice.  Therefore this guide may seem somewhat simplistic
to those who have significant web experience.  If you fall into this camp,
you should check out the PouchDB introduction [here](http://cwmma.tumblr.com/post/41782044503/lets-make-an-app-pouchdb).

I ran all of my code on Ubuntu Linux.  The only part that might not
translate to other environments verbatim is the setup of a local server,
but that should not be too challenging to substitute. Enough with the caveats!
On to the content.

## Setting up a simple page

For the purpose of this tutorial we will create a bare-bones HTML page with
a few buttons to expose some of pouch's functions.

    {% highlight html %}
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

    </body>
    </html>
    {% endhighlight %}

Make a new folder and save the above in it as `index.html`. You should be 
able to open `index.html` in a web browser and see something like this:

<img src="/assets/images/simple_page_with_buttons.png" alt="HTML page with buttons" title="Sample page"/>

Most of this should be rather self-explanatory.  The `display-area`
will be used later to show the contents of the database.

## Adding PouchDB

Create a new folder named `js` within the folder you created for the previous step.
The new folder will contain the Javascript code for your page.  Now to get
PouchDB itself.  The easiest method to acquire the latest version is to
download it directly from [PouchDB's website](http://pouchdb.com/). Currently,
the download link just gives you the code on a new page.  Copy and paste this
into a file named `pouchdb.js` in your `js` folder.  Either the 'Production'
or 'Development' build will work; the 'Production' build is just a condensed
version for serving to clients.

Now we need some actual application code to allow the buttons on the html page
to interact with the database.  This will be handled in a file appropriately
titled `app.js` in the `js` folder.  Here is the code in its entirety (I
will discuss each section below):

    {% highlight js %}
    (function() {
        'use strict';

        var db = null;
        var dbname = 'idb://pouch_intro';

        window.addEventListener( 'load', loadPouch, false );

        function loadPouch() {
            Pouch(dbname, function(err, pouchdb){
                if(err){
                    alert("Can't open pouchdb database");
                }else{
                    db = pouchdb;
                    windowLoadHandler();
                }
            });
        }

        function windowLoadHandler() {
            //Other logic to be executed when the page loads should be placed here
            addEventListeners();
        }

        function addEventListeners() {
            //Hook in to various parts of the page
            document.getElementById('upload').addEventListener( 'click', addToDB, false);
            document.getElementById('show').addEventListener( 'click', showText, false);
            document.getElementById('reset').addEventListener( 'click', reset, false);
        }

        var reset= function(){
            Pouch.destroy(dbname, function(err1){
                if(err1){
                    alert("Database destruction error")
                } else {
                    Pouch(dbname, function(err2, pouchdb){
                        if(err2){
                            alert("Database creation error")
                        } else {
                            db= pouchdb;
                        }
                    })
                }
            });
        }

        var addToDB = function(){
            var text= document.getElementById('enter-text').value;
            db.post({text: text});
        }

        var showText= function(){
            db.allDocs({include_docs: true}, function(err, res){
                if(!err){
                    var out= "";
                    res.rows.forEach(function(element){
                        out+= element.doc.text + '<br>';
                    });
                    document.getElementById('display-area').innerHTML= out;
                }
            })
        }
    })();
    {% endhighlight %}

This can be broken down into several distinct components.  First is the
initialization:

    {% highlight js %}
    var db = null;
    var dbname = 'idb://pouch_intro';

    window.addEventListener( 'load', loadPouch, false );

    function loadPouch() {
        Pouch(dbname, function(err, pouchdb){
            if(err){
                alert("Can't open pouchdb database");
            }else{
                db = pouchdb;
                windowLoadHandler();
            }
        });
    }
    {% endhighlight %}

The name of the database is up to you.  It is important that this name doesn't conflict
with other databases that the user might have on her computer.  One approach
to this might be to prefix the name of your database with the name of your
application.  The event listener serves to execute a specific function when
the page loads.  That function is `loadPouch`, and it opens the database
(first creating it if necessary) before passing control to `windowLoadHandler`.
`Pouch` is a constructor that creates a database with the specified name and
executes the supplied callback with the new or loaded database as an argument.

Next is the setup:

    {% highlight js %}
    function windowLoadHandler() {
        //Other logic to be executed when the page loads should be placed here
        addEventListeners();
    }

    function addEventListeners() {
        //Hook in to various parts of the page
        document.getElementById('upload').addEventListener( 'click', addToDB, false);
        document.getElementById('show').addEventListener( 'click', showText, false);
        document.getElementById('reset').addEventListener( 'click', reset, false);
    }
    {% endhighlight %}

`windowLoadHandler` is just an organizational construct to split up tasks
after loading the page.  Most likely you will want to do things such as present
a specific message to the user or display stored data. For this example, the
only thing we do is tell the html which Javascript function to call when each
button is pressed.

Third is the reset function:

    {% highlight js %}
    var reset= function(){
        Pouch.destroy(dbname, function(err1){
            if(err1){
                alert("Database destruction error")
            } else {
                Pouch(dbname, function(err2, pouchdb){
                    if(err2){
                        alert("Database creation error")
                    } else {
                        db= pouchdb;
                    }
                })
            }
        });
    }
    {% endhighlight %}

The reset function combines two useful PouchDB functions.  The first is
`Pouch.destroy` which removes the previous database.  The second is the
constructor which we saw before. Notice that the callback prevents the
constructor from being executed before the database has been successfully
destroyed.

Fourth is the function for adding content to the database:

    {% highlight js %}
    var addToDB = function(){
        var text= document.getElementById('enter-text').value;
        db.post({text: text});
    }
    {% endhighlight %}

Perhaps the most important function of PouchDB is saving data.  Fortunately
that is very easy to do!  Simply post a JSON object and you are good to go.
For this example, the object posted only has a single property, which
contains whatever is in the text box on the html page. Note that updating
documents which already exist is done using `db.put`.

Finally we have a function to display the data in the database:

    {% highlight js %}
    var showText= function(){
        db.allDocs({include_docs: true}, function(err, res){
            if(!err){
                var out= "";
                res.rows.forEach(function(element){
                    out+= element.doc.text + '<br>';
                });
                document.getElementById('display-area').innerHTML= out;
            }
        })
    }
    {% endhighlight %}

`db.allDocs` produces an object that contains a list of rows.  Each row
corresponds to a single document in the database.  Every row has three properties:
`id` which corresponds to the '_id' field of the document, `key` which matches
`id`, and `value` which contains the current revision number for the
document.  If `include_docs` is true, each row will also have a `doc`
property that contains the entire document as found in the database.

Although we used `db.allDocs` here, we could have achieved the same effect
with a query:

    {% highlight js %}
    var showTextAlternative= function(){
        var map= function(doc){
            if(doc.text){
                emit(doc._id, doc.text);
            }
        };

        db.query({map: map}, function(err, res){
            if(!err){
                var out= "";
                res.rows.forEach(function(element){
                    out+= element.value + '<br>';
                });
                document.getElementById('display-area').innerHTML= out;
            }
        })
    };
    {% endhighlight %}

Queries in PouchDB use a simple map-reduce structure to iterate across the
documents in the database and pick out the parts you want.  Like before, the `include_docs`
option gives you the entire matched document, instead of just the properties
included in the emit function. You can also use a reduce function to boil
the results down to a single object.  This is useful if you are counting,
averaging, or otherwise aggregating some value.  You can find a reference for
map-reduce queries in CouchDB [here](http://guide.couchdb.org/draft/views.html).
In general, CouchDB references apply to PouchDB as well.

A little bit more about `emit`.  This is a function that is implicitly
available when using PouchDB.  Each call to `emit` adds a new key-value pair
(row) to the table of results.  The first argument becomes the key of
the pair, and the second argument is its value.  The key can be a complex
JSON object, or just a simple integer.  In this example we used the `_id` property
which every document has.  If you create a document using `db.post`, `_id`
is automatically assigned for you (you can set `_id` manually using
`db.put`).  You can learn more about using emit
[on the CouchDB wiki](http://wiki.apache.org/couchdb/Introduction_to_CouchDB_views).

Now that we have a database and application code, all that remains is to
include the Javascript files in the html page.  Replace `index.html` with the
following:

    {% highlight html %}
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

    <script src="js/pouchdb.js"></script>
    <script src="js/app.js"></script>
    </body>
    </html>
    {% endhighlight %}

The only change is the two `<script>` tags at the bottom.  You should now have
a page that works like [this](/assets/code/pouchdb_intro/index.html).


## Running a local server

On the command line open the directory that contains `index.html` and run this:

    python2 -m SimpleHTTPServer 8888

You can now access your page on [port 8888](http://localhost:8888).  Right
now this is no different than simply opening the page in a web browser, but
once we add other features the distinction will become important.

##What's next?

All of the code in this post can be found [here](https://github.com/briantoth/briantoth.github.com/tree/master/assets/code/pouchdb_intro).

In my next post, I will discuss setting up a local instance of CouchDB,
syncing with it, and doing the same with a CouchDB instance in the cloud.
