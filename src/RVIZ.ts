import { Widget } from '@lumino/widgets';

class RVIZWidget extends Widget {
    /**
    * Construct a new APOD widget.
    */
    constructor() {
      super();
      this.addClass('my-apodWidget');
      this.iframe = document.createElement('iframe');
      this.iframe.src = `http://${location.hostname}:8001/rvizweb/www/index.html`;
      // this.iframe.src = `http://127.0.0.1:5501/examples/urdf.html`;
      this.iframe.style.width = '100%';
      this.iframe.style.height = '100%';
      this.node.appendChild(this.iframe);
    }
  
    /**
    * The image element associated with the widget.
    */
    readonly iframe: HTMLIFrameElement;
  }
  
export default RVIZWidget;
