# js-animelist-timeline

Generate an SVG timeline chronologizing when you watched anime. https://linkviii.github.io/js-animelist-timeline/

Test it with Username: linkviii, Width: 2000, From: 2016-00-00, To: 2016-06-00. https://linkviii.github.io/js-animelist-timeline/?uname=linkviii&width=2000&minDate=2016-00-00&maxDate=2016-06-00


Uses:
* https://github.com/Linkviii/js-timeline, a js rewrite of https://github.com/jasonreisman/Timeline
  * [svg.js](http://svgjs.com/): © 2012 - 2016 Wout Fierens - svg.js is released under the terms of the MIT license. 
  * [strftime](https://github.com/samsonjs/strftime): Copyright 2010 - 2016 Sami Samhuri sami@samhuri.net - MIT license
* https://github.com/eligrey/FileSaver.js/ 
* jquery

Timeline layout issues are probably for js-timeline. 

Project is MIT licensed

Privacy note: MAL's api is proxied through yahoo's yql service. Some reason loading external xml is a no no but json is ok?
