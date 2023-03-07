import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ILauncher } from '@jupyterlab/launcher';
import { LabIcon } from '@jupyterlab/ui-components';
import iconStr from '../style/robot.svg';

import {
  ICommandPalette,
  MainAreaWidget,
  WidgetTracker
} from '@jupyterlab/apputils';

import RVIZWidget from './RVIZ';

/**
 * Initialization data for the jupyterlab_rviz extension.
 */
function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  launcher: ILauncher | null,
  restorer: ILayoutRestorer | null) {
  console.log('JupyterLab extension jupyterlab_rviz is activated!');

  // Declare a widget variable
  let widget: MainAreaWidget<RVIZWidget>;

  // Add an application command
  const command: string = 'rviz:open';

  const icon = new LabIcon({
    name: 'launcher:rviz-icon',
    svgstr: iconStr,
  });

  app.commands.addCommand(command, {
    caption: 'Open Rvizweb',
    label: (args) => (args['isPalette'] ? 'Open Rvizweb' : 'Rvizweb'),
    icon: (args) => (args['isPalette'] ? '' : icon),
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
        app.shell.add(widget, 'main', { mode: 'split-right' });
      }

      // Activate the widget
      app.shell.activateById(widget.id);
    }
  });

  // Add the command to the palette.
  palette.addItem({ command, category: 'Visualization' });

  if (launcher) {
    launcher.add({
      command,
      rank: 1,
    });
  }

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
  optional: [ILauncher, ILayoutRestorer],
  activate: activate
};

export default plugin;
