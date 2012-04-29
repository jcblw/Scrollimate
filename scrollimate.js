/*
 * Scrollimate 0.1.2 - A Jquery Scrolling Animation Plugin
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
        //TODO Combine change and offset into one method
        calculate = {
          //Abstract change
          change : function(i ,key){

            //Get units of keys (start v. end)
            //In more addvanced cases there need to a parser that will get out differnt values of key values to compare change
            var start = parse.units(i, key, 'start'),
              end = parse.units(i, key, 'end'), n, res;

            //If unit is a bracketed unit
            if(typeof start === 'object' && typeof end === 'object'){
                n = 0;
                res = [];
                //Loop through all values
                while( n < start.length){
                  res.push((start[n] - end[n]) * (-1));
                  n += 1;
                }
            }
            //If unit is a suffix or number
            else{
              res = (start - end) * (-1);
            }

            //push data to global data for future use
            data[i].change.css[key] = res;

          },
          offset : function(i, key, percent){

            var start = data[i].change.css[key], res;

            if(typeof start === 'object'){
                n = 0;
                res = [];
                //Loop through all values
                while( n < start.length){
                  res.push(start[n] * percent);
                  n += 1;
                }
            }
            //If unit is a suffix or number
            else{
              res = start * percent;
            }

            return res;

          }
        },
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
                  
                    calculate.change(i, sk[y]);
                  
                //Close for
                }
                
            },
            // Need to create an abstract for unit type
            //then save to to data structure
            units : function(n, key, type){

              //Array of supported units first is suffix second is bracketed values 
              var supported = [/^\-*\.*[0-9]+\.*[0-9]*(%|[a-z]+)+/, /[a-z]+[A-Z]*\(( ?\-*[0-9]?.?[0-9]+,*[a-z]* ?)+\)/],
                //Actual Value
                value = data[n][type][key],
                //Interger to iterate
                i = 0,
                //A flag to stop while loop
                notFound = true;
              // Loop through all supprted values until find
              while(i < supported.length && notFound){
                // Test for support
                if(supported[i].test(value)){
                  //We have found a supported unit
                  //Lets make a unit and format
                  if(typeof data[n].unit === 'undefined' && typeof data[n].format === 'undefined'){
                    data[n].unit = {};
                    data[n].format = {};
                  }
                  
                  // Found bracketed values
                  // TODO : Now since we have a function to split up intergerd in a brakets
                  // Now I need to make it into a multi functional split so i can split then
                  // calculate every interger individually.
                  if(i >= 1){

                    var pre, suf;

                    //Split apart at brackets
                    value = value.split(/[\(\)]/g);

                    pre = value[0];

                    // Split apart values
                    value = value[1].split(',');

                    if(value.length === 1){
                      // Store unit
                      if(typeof data[n].unit[key] === 'undefined' && typeof data[n].format[key] === 'undefined'){
                        suf = value[0].match(/[a-z]+/)[0];
                        data[n].unit[key] = [pre, suf];
                        //Bracketed Suffix
                        data[n].format[key] = 'bs';
                      }

                      value = value[0].split(/[a-z]+/);
                      value = parseFloat(value[0]);
       
                    }else{
                      var q = 0;

                      if(typeof data[n].unit[key] === 'undefined' && typeof data[n].format[key] === 'undefined'){
                        data[n].unit[key] = pre;
                        //Bracketed
                        data[n].format[key] = 'b';
                      }

                      while(q < value.length){
                        value[q] = parseFloat(value[q]);
                        q += 1;
                      }

                    }


                  }
                  else{

                    //Lets strip to the intergers and add the modifier
                    calc = parseFloat(value);
                    //TODO test for exact unit so that we can handle advanced case
                    //Lets push our unit & format into our data
                    if(typeof data[n].unit[key] === 'undefined' && typeof data[n].format[key] === 'undefined'){
                      data[n].unit[key] = value.replace(calc, '');
                      data[n].format[key] = 's';
                    }

                    //Set the value
                    value = calc;

                  }

                  //build raw data
                  if(typeof data[n].raw === 'undefined'){
                    data[n].raw = {};
                  }
                  //build raw type
                  if(typeof data[n].raw[type] === 'undefined'){
                    data[n].raw[type] = {};
                  }
                  // Store raw data
                  data[n].raw[type][key] = data[n][type][key];

                  //Let just store the value in this nice format
                  data[n][type][key] = value;
  
                  //stop our while loop
                  notFound = false;
                }

                i += 1;

              }

              //Check if we even found a unit if not just add 
              return (notFound) ? parseFloat(value) : value;

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
                  offset = calculate.offset(i, keys[y], percent);

                  
                  //Let make out css obj
                  //Finde out how to format result
                  if(typeof data[i].format === 'undefined'){
                    //Normal result
                    calc = data[i].start[keys[y]] + offset;

                  }else{
          
                    switch(data[i].format[keys[y]]){
                      //Bracketed Value
                      case 'b' : 

                        var n = 0;
                        calc = [];

                        while(n < offset.length){
                          if(n === 3){
                            calc.push(data[i].start[keys[y]][n] + offset[n]);
                          }else{
                            calc.push( Math.round(data[i].start[keys[y]][n] + offset[n]));
                          }

                          n += 1;
                        } 
                        //Need to a suffix to end
                        calc = data[i].unit[keys[y]] + '(' + calc.join(',') + ')';
                        break;
                      // Is a bracketed value with a suffix
                      case 'bs' : 
                        calc = data[i].unit[keys[y]][0] + '(' + (data[i].start[keys[y]] + offset) + data[i].unit[keys[y]][1] + ')';
                        break;
                      // Value with a suffix
                      case 's' :
                        // Normal Interger
                        calc = (data[i].start[keys[y]] + offset) + data[i].unit[keys[y]];
                        break;

                      default :

                        calc = data[i].start[keys[y]] + offset;
                        break;

                    }
            
                  }
                  
                  obj[keys[y]] = calc;
              }
              //return object for usage in move
              return obj;
                
            }
        },
        move = function(i, scrollTop){
          // Defing change and also another int to avois conflicts
          var change = parse.change(i, scrollTop);

          $('.scrollimate-' + i).css(change);
            
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
                  $('.scrollimate-' + z).css((typeof data[z].raw === 'undefined') ? data[z].start : data[z].raw.start);
                  //If callback is defined then lets call it
                  if(typeof(data[z].settings.start) === 'function'){
                      data[z].settings.start(z);
                  }
                  data[z].state = false;
                  data[z].orientation = 'above';
                }
              }else if (scrollTop > data[z].param.end){
                if(data[z].state || data[z].orientation === 'above'){
                  $('.scrollimate-' + z).css((typeof data[z].raw === 'undefined') ? data[z].end : data[z].raw.end);
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

