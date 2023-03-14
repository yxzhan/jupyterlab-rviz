import { Widget } from '@lumino/widgets';
import { PageConfig } from '@jupyterlab/coreutils';

class RVIZWidget extends Widget {
    /**
    * Construct a new APOD widget.
    */
    constructor() {
      super();
      // Get base URL of current notebook server
      let baseUrl = PageConfig.getBaseUrl()
      // Construct URL of our proxied service
      this.addClass('my-apodWidget');
      this.iframe = document.createElement('iframe');
      let rvizUrl = `${baseUrl}proxy/8001/rvizweb/www/index.html?client=jupyterhub`;
      console.log('rvizweb url:', rvizUrl)
      this.iframe.src = rvizUrl;
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
