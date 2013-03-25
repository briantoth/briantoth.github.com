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
    };

    function windowLoadHandler() {
        //Other logic to be executed when the page loads should be placed here
        addEventListeners();
    };

    function addEventListeners() {
        //Hook in to various parts of the page
        document.getElementById('upload').addEventListener( 'click', addToDB, false);
        document.getElementById('show').addEventListener( 'click', showText, false);
        document.getElementById('reset').addEventListener( 'click', reset, false);
    };

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
                    } })
            }
        });
    };

    var addToDB = function(){
        var text= document.getElementById('enter-text').value;
        db.post({text: text});
    };

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
    };

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
})();
