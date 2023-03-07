import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette,
  MainAreaWidget,
  WidgetTracker
} from '@jupyterlab/apputils';

import RVIZWidget from './RVIZ';

/**
 * Initialization data for the jupyterlab_rviz extension.
 */
function activate(app: JupyterFrontEnd, palette: ICommandPalette, restorer: ILayoutRestorer | null) {
  console.log('JupyterLab extension jupyterlab_rviz is activated!');

  // Declare a widget variable
  let widget: MainAreaWidget<RVIZWidget>;

  // Add an application command
  const command: string = 'rviz:open';

  app.commands.addCommand(command, {
    label: 'Open Rvizweb',
    execute: () => {
      if (!widget || widget.isDisposed) {
        const content = new RVIZWidget();
        widget = new MainAreaWidget({content});
        widget.id = 'rviz-jupyterlab';
        widget.title.label = 'Rvizweb';
        widget.title.closable = true;
      }
      if (!tracker.has(widget)) {
        // Track the state of the widget for later restoration
        tracker.add(widget);
      }
      if (!widget.isAttached) {
        // Attach the widget to the main work area if it's not there
        app.shell.add(widget, 'main');
      }

      // Activate the widget
      app.shell.activateById(widget.id);
    }
  });

  // Add the command to the palette.
  palette.addItem({ command, category: 'Tutorial' });

  // Track and restore the widget state
  let tracker = new WidgetTracker<MainAreaWidget<RVIZWidget>>({
    namespace: 'rviz'
  });
  if (restorer) {
    restorer.restore(tracker, {
      command,
      name: () => 'rviz'
    });
  }
};

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_rviz',
  autoStart: true,
  requires: [ICommandPalette],
  optional: [ILayoutRestorer],
  activate: activate
};

export default plugin;
