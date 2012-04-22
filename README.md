## Scrollimate

Scrollimate will animate while you scroll. Scrollimate is built for the jQuery library.

##Usage

Scrolimate has three required parameters. First is the hot spots, this is a start point and an end point. This will define the length of the animation. Next is the start point. This will be a set of css properties that a relativly simple, and are in pixel units. Last is the end point, this is a list of css properties that will be end product of the tranformed element. In a simple senario it will look something like this.

    $('.scrollme')
        .scrollimate(
        // The range of animation in pixels
        {
            start: 1
            end: 1000
        },
        // The CSS property to tranform FROM
        {
            opacity: 0,
            width: '0%',
            height: '20px'
        },
        // The CSS property to tranform TO
        {
            opacity:1
            width: '100%',
            height: '20px'
        },
        {
            start: function(){
                alert('I started scrollimating');
            },
            end: function(){
                alert('Im done scrollimating');
            }
        }
        );
        
##TODO - Feature-list

_Advanced units_

Eg. Using CSS rotate, box shadow, borders , and maybe even rgb and hsl

_Parent-Scroll_

Right now its always based off of window being scroll i think it could be nice if there was a way delegate the scroll tracking to specific elements as well.





