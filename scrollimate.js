/*
 * Scrollimate 0.0.3 - A Jquery Scrolling Animation Plugin
 *
 * Author: Jacob Lowe (redeyeoperations.com)
 * Twitter Handle @jacoblowe2dot0
 *
 * Copyright (c) 2010 Jacob Lowe (http://redeyeoperations.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * 
 * Built for jQuery library
 * http://jquery.com
 * TODO: Add resize listener to resize window 
 *
 */

(function($){
    var data = {},
        //Set of utilites for plugin
        utils = {
          // Get keys of object
          getKeys : function(obj){
              var ar = [];
              for (var key in obj) {
                 ar.push(key);
              }
              //returns as array
              return ar;
          },
          //get size of object
          size: function(obj){
              var size = 0, key;
              for (key in obj) {
                  if (obj.hasOwnProperty(key)) size++;
              }
              //returns interger
              return size;
          }
        },
        count = [],
        calc, y, sk, ek, ele,
        parse = {
            params : function(i){
                //define the chang object literal
                data[i].change = {};
                // Calculate the amount of pixels in scroll area
                calc = data[i].param.end - data[i].param.start;
                //Add data to global data
                data[i].change.scroll = calc;
                //Now lets get the amount of change between each key
                //=================================//
                //Defineing change.css
                data[i].change.css = {};
                //get array of startkeys
                sk = utils.getKeys(data[i].start);
                //get array of endkeys
                ek = utils.getKeys(data[i].end);
                //loop through all start keys
                for(y =0; y < sk.length; y += 1){
                  if($.inArray(sk[y], ek) > -1){
                    //key match found
                    //Get units of keys (start v. end)
                    //In more addvanced cases there need to a parser that will get out differnt values of key values to compare change
                    calc = parseFloat(data[i].start[sk[y]]) - parseFloat(data[i].end[sk[y]]);
                    //push data to global data
                    data[i].change.css[sk[y]] = calc * -1;
                  }else{
                    //Test to see if original css is differnt from start key
                    if(ele.css(sk[y]) !== data[i].start[sk[y]]){
                      // If is differnt find differnce
                      calc = parseFloat(data[i].start[sk[y]]) - parseFloat(ele.css(sk[y]));
                      //push data to global data object
                      //data[i].param[sk[y]] = calc;
                    }
                  // Close else
                  }
                //Close for
                }
                
            },
            // Need to create an abstract for unit type
            //then save to to data structure
            units : function(value, modifier){
              var supported = ['px', 'em', '%', 'pt', '\\('],
                i = 0,
                notFound = true;
              while(i < supported.length && notFound){
                if(RegExp(supported[i], 'gi').test(value)){
                  //We have found a supported unit
                  
                  // Found bracketed values
                  // TODO : Now since we have a function to split up intergerd in a brakets
                  // Now I need to make it into a multi functional split so i can split then
                  // calculate every interger individually.
                  if(i >= 4){

                    //Split apart at brackets
                    value = value.split(/[\(\)]/gi)[1].split(',');
                    //Todo we need to save the first value of the first split
                    //so we can attach it again

                  }
                  else{

                    //Lets strip to the intergers and add the modifier
                    value = parseFloat(value);
                    //TODO test for exact unit so that we can handle advanced case

                    value = value + modifier + supported[i];

                  }
  
                  //stop our while loop
                  notFound = false;
                }
                i += 1;
              }
              //Check if we even found a unit if not just add
              return (notFound) ? parseFloat(value) + modifier : value;
            },
            //Checking amount of chang then applying to values
            change : function(i, scrollTop){
              //Defining percent
              var percent, obj = {}, keys = utils.getKeys(data[i].change.css), offset;
              //Get position realtive to scroll area
              calc = scrollTop - data[i].param.start;
              // Find percent of scroll area
              percent = calc / data[i].change.scroll;
              // loop through values and store in obj
              for (y=0;y < utils.size(data[i].change.css); y += 1){
                  //Calculate the offset relative to entire change
                  offset = data[i].change.css[keys[y]] * percent;
                  // get right percent of value and push to obj
                  calc = parse.units(data[i].start[keys[y]], offset, 'sum');
                  obj[keys[y]] = calc;
              }
              //return object for usage in move
              return obj;
                
            }
        },
        move = function(i, scrollTop){
          // Defing change and also another int to avois conflicts
          var change = parse.change(i, scrollTop), p, keys = utils.getKeys(data[i].start), css = {};
          //loop through all values
          for(p = 0; p < utils.size(data[i].start); p += 1){
              css[keys[p]] = change[keys[p]];
          }
          //console.log(css);
          $('.scrollimate-' + i).css(css);
            
        },
        handle = function (scrollTop) {
          //define new var for handler interger
          // to avoid conflicts
          var z;
          //Loop through all element that have scrolimate applied
          for (z=0; z < utils.size(data); z += 1){
              //Setting state for elements
              if(typeof(data[z].state) === 'undefined'){
                //Starting as true to fix css if scrolled down the page already on load
                data[z].state = true;
              }
              //Setting orientation above or below
              if(typeof(data[z].orientation) === 'undefined'){
                //Set orientation state start as null
                data[z].orientation = null;
              }
              //Check if it in the right area
              if(scrollTop > data[z].param.start && scrollTop < data[z].param.end){
                // If the change object is defined
                if(typeof data[z].change === 'object'){
                  // Let start moving our element
                  move(z, scrollTop);
                  data[z].state = true;
                  data[z].orientation = null;
                }else{
                  //Lets define that change object
                  //parse.params(y);
                }
              //close if
              }else if (scrollTop < data[z].param.start){
                if(data[z].state || data[z].orientation === 'below'){
                  $('.scrollimate-' + z).css(data[z].start);
                  //If callback is defined then lets call it
                  if(typeof(data[z].settings.start) === 'function'){
                      data[z].settings.start(z);
                  }
                  data[z].state = false;
                  data[z].orientation = 'above';
                }
              }else if (scrollTop > data[z].param.end){
                if(data[z].state || data[z].orientation === 'above'){
                  $('.scrollimate-' + z).css(data[z].end);
                  //If callback is defined then lets call it
                  if(typeof(data[z].settings.end) === 'function'){
                      data[z].settings.end(z);
                  }
                  data[z].state = false;
                  data[z].orientation = 'below';
                }
              }
          // Close for loop
          }
        // Close handle
        };
    // Adding scrollimate to jquery scope
    $.fn.scrollimate = function (param, start, end, settings) {
        //defining element
        ele = $(this);
        //adding the appropiate
        ele
          .attr('rel', count.length)
          .addClass('scrollimate-' + count.length)
          .css(start);
        //Setting all incoming data to global data
        data[count.length] = {
            param :     (typeof param === 'object') ? param : {},
            start :        (typeof start === 'object') ? start : {},
            end :         (typeof end === 'object') ? end : {},
            settings :   (typeof settings === 'object') ? settings : {}
        };
        // Intial setup
        parse.params(count.length);
        //Lets count elements
        count.push(0);
        // return ele for chaining
        return ele;
    };
    //scroll event listener
    $(window).scroll(function(){
        // Throw scrolltop into handle
        handle($(this).scrollTop());
    });
}(jQuery));

