import { Widget } from '@lumino/widgets';
import "../style/index.css";
class IFrameWidget extends Widget {
    /**
    * Construct a new IFrameWidget widget.
    */
    constructor(url: string) {
      super();
      console.log(`Open url:\n${url}`)
      const div = document.createElement("div");
      div.classList.add("iframe-widget");
      let iframe = document.createElement("iframe");
      iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      div.appendChild(iframe);
      this.node.appendChild(div);
    }
  }
  
export default IFrameWidget;
