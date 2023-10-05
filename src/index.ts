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

import { ILauncher } from '@jupyterlab/launcher';
import { LabIcon } from '@jupyterlab/ui-components';
import { PageConfig } from '@jupyterlab/coreutils';
import { DockLayout } from '@lumino/widgets';

import IFrameWidget from './iframe';
import { setRosParamsFromUrl } from './rosparam';
import iconStr from '../style/logo_jupyter.svg';

const BASE_URL = PageConfig.getBaseUrl()

/**
 * Initialization data for the jupyterlab_rviz extension.
 */
async function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  launcher: ILauncher | null,
  restorer: ILayoutRestorer | null) {
  console.log('JupyterLab extension jupyterlab_rviz is activated!');
  await setRosParamsFromUrl(BASE_URL);

  let response = await fetch(`${BASE_URL}proxy/8001/rvizweb/webapps/app.json`);
  if (!response.ok) {
    const data = await response.json();
    if (data.error) {
      console.log(data.error)
    }
    return;
  }
  const RvizApps: any[] = await response.json();

  for (let appConfig of RvizApps) {
    let command = await initRvizApp(app, palette, launcher, restorer, appConfig, RvizApps.indexOf(appConfig))
    if (appConfig.start) {
      app.commands.execute(command, { origin: 'init' }).catch((reason) => {
        console.error(
          `An error occurred during the execution of ${command}.\n${reason}`
        );
      });
    }
  }
};

async function initRvizApp(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  launcher: ILauncher | null,
  restorer: ILayoutRestorer | null,
  appConfig: { [key: string]: string },
  rank: number | undefined) {

  // Declare widget variables
  let widget: MainAreaWidget<IFrameWidget>;
  let url = BASE_URL;
  let iconUrl = appConfig.url;

  // Check internal or external URL
  try {
    url = `${new URL(appConfig.url).href}?baseurl=${BASE_URL}`;
  } catch (error) {
    url = `${BASE_URL}${appConfig.url}?baseurl=${BASE_URL}`;
    console.log(url)
  }
  try {
    iconUrl = new URL(appConfig.icon).href;
  } catch (error) {
    iconUrl = `${BASE_URL}${appConfig.icon}`;
  }

  // Hard code for webviz url parameter
  // Have not figured out a better solution :(
  if (appConfig.name === 'webviz') {
    let wsUrl = new URL(BASE_URL);
    wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws'
    url = `${BASE_URL}${appConfig.url}?rosbridge-websocket-url=${wsUrl.href}proxy/9090`;
  }

  // Get icon svg
  let response = await fetch(iconUrl);
  if (response.ok) {
    appConfig.iconStr = await response.text();
  }

  // Add an application command
  const closable = appConfig.closable !== undefined ? Boolean(appConfig.closable) : true;
  const command: string = `rviz:${appConfig.name}`;
  const icon = new LabIcon({
    name: `launcher:${appConfig.name}`,
    svgstr: appConfig.iconStr || iconStr,
  });

  app.commands.addCommand(command, {
    caption: appConfig.title,
    label: (args) => (args['isPalette'] ? `Open ${appConfig.title}` : appConfig.title),
    icon: (args) => (args['isPalette'] ? '' : icon),
    execute: () => {
      if (!widget || widget.isDisposed) {
        const content = new IFrameWidget(url);
        widget = new MainAreaWidget({ content });
        widget.id = `rviz-${appConfig.name}`;
        widget.title.label = appConfig.title;
        widget.title.closable = closable;
      }
      if (!tracker.has(widget)) {
        // Track the state of the widget for later restoration
        tracker.add(widget);
      }
      if (!widget.isAttached) {
        // Attach the widget to the main work area if it's not there
        let mode = appConfig.mode as DockLayout.InsertMode;
        app.shell.add(widget, 'main', { mode });
      }

      // Activate the widget
      app.shell.activateById(widget.id);
    }
  });
  // Add the command to the palette.
  palette.addItem({ command, category: 'Robotics' });

  if (launcher) {
    launcher.add({
      command,
      category: 'Robotics',
      rank
    });
  }

  // Track and restore the widget state
  let tracker = new WidgetTracker<MainAreaWidget<IFrameWidget>>({
    namespace: `rviz-${appConfig.name}`
  });
  if (restorer) {
    restorer.restore(tracker, {
      command,
      name: () => `rviz-${appConfig.name}`
    });
  }
  return command
}

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_rviz',
  autoStart: true,
  requires: [ICommandPalette],
  optional: [ILauncher, ILayoutRestorer],
  activate: activate
};

export default plugin;
