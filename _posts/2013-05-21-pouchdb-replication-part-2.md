---
layout: post
title: "PouchDB Replication Part 2"
description: ""
category: 
tags: [PouchDB, replication]
---
{% include JB/setup %}

##Review

This is a quick post to finish up where the last one left off.  If you haven't read
[the replication tutorial]({% post_url 2013-04-07-pouchdb-replication %}), I recommend
that you check it out.  I will extend that guide to include replicating with a CouchDB
instance in the cloud.

Before you get started you will need a database to work with.  I have been using [Iris Couch](http://www.iriscouch.com/)
which has a free service that seems to work pretty well.  There are also other providers out there
such as [Cloudant](https://cloudant.com/).

##Enabling CORS

CouchDB 1.3 includes a built-in CORS proxy which greatly simplifies the process of accessing
your database from another domain.  All you need to do is turn it on.  The relevant setting is
`httpd,enable_cors` and it can be changed to 'true' using Futon or with cURL.

    curl -v -H "Content-Type:application/json" -X PUT https://<your couch>.iriscouch.com:6984/_config/httpd/enable_cors -d '"true"'

Unfortunately, this might not work for you.  When I initially tried using Futon, my browser hung
indefinitely.  cURL was a little more helpful, returning a message which told me that the setting
I tried to change was read-only.  A little digging revealed that only the settings listed in
`httpd,config_whitelist` may be changed.  If you happen to own the machine that your CouchDB is
hosted on, this isn't a big deal; simply modify your whitelist to include `httpd,enable_cors`.
If you don't, you need to contact support and ask them to do this for you.  I was able to reach
the Iris Couch guys on Freenode and they got things sorted out quickly.

##Trying it out

Assuming you were able to enable CORS, the only thing left is to specify which origins are accepted.
For now we will use a wildcard to allow all origins.  The relevant setting is `cors,origins`.

    curl -v -H "Content-Type:application/json" -X PUT https://<your couch>.iriscouch.com:6984/_config/cors/origins -d '"*"'

Some providers may already have this set.  Now modify your push and pull functions to target your
cloud database.

    var push= function(){
        Pouch.replicate('idb://pouch_intro', 'https://<your couch>.iriscouch.com:6984/test_db', function(err,resp){
            if(err){
                alert("Push failed!")
            }
        })
    };

    var pull= function(){
        var filter= function(doc){
            return doc.pullAble;
        }
        Pouch.replicate('https://<your couch>.iriscouch.com:6984/test_db', 'idb://pouch_intro',
                        function(err,resp){
                            if(err){
                                alert("Pull failed!")
                            }
                        })
    };

You should now be able to sync with your remote database in the exact same way that you sync with
a local one (the delays will be slightly longer of course).  That's pretty cool.

##Advanced CORS settings

You probably don't want any origin to be able to access your database.  Let's change that.

    curl -v -H "Content-Type:application/json" -X PUT https://sardonic.iriscouch.com:6984/_config/cors/origins -d '"http://localhost:8888"'

Now only requests from port 8888 on a local host will be accepted.  Recall that you can use
`python2 -m SimpleHTTPServer 8888` in the directory containing `index.html` in order to set up a
local server running your application.  Of course, this isn't actually secure; anyone can make
requests originating from localhost:8888.  For a real application you would restrict the accepted
origins to your domain name.  A basic overview of CouchDB's CORS support is available [on the CouchDB wiki](http://wiki.apache.org/couchdb/CORS).
If you are interested in further tightening your access restrictions, [this resource](http://kxepal.iriscouch.com/docs/1.3/cors.html)
may be helpful.

All of the code in this post can be found [here](https://github.com/briantoth/briantoth.github.com/tree/master/assets/code/pouchdb_replication_part2).
