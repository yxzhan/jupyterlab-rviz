import ROSLIB from 'roslib';

export function setRosParamsFromUrl(baseUrl: string) {
  const ros = createRos(getWsUrl(baseUrl))
  const jupyterProxyUrl = `${baseUrl}proxy/8001/rvizweb/webapps/rvizweb/build/www/index.html?baseurl=${baseUrl}`
  new ROSLIB.Param({
    ros : ros,
    name : 'rvizweb/jupyter_proxy_url'
  }).set(jupyterProxyUrl, function() {
    console.log('Set ROS param: /rvizweb/jupyter_proxy_url to ' + jupyterProxyUrl)
  });
  for (const [key, value] of new URLSearchParams(window.location.search).entries()) {
    const _param = new ROSLIB.Param({
      ros : ros,
      name : 'nbparam_' + key
    });
    _param.set(value, function() {
      console.log(`Set ROS param '${key}' to '${value}`)
    });
  }
}

function createRos(url: string) {
  let ros = new ROSLIB.Ros({url})
  ros.on('error', (error: Error) => { 
    console.log( error )
  })
  ros.on('connection', (evt: Event) => {
    console.log('Connection made!');
  })
  return ros
}

function getWsUrl (baseUrl: string) {
  let wsUrl = new URL(baseUrl);
  wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws'
  return wsUrl.href + 'proxy/9090'
}
