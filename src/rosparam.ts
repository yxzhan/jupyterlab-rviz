import ROSLIB from 'roslib';

export function setRosParamsFromUrl(baseUrl: string) {
  const ros = createRos(getWsUrl(baseUrl))

  for (const [key, value] of new URLSearchParams(window.location.search).entries()) {
    const _param = new ROSLIB.Param({
      ros : ros,
      name : 'nbparam_' + key
    });
    _param.set(value, function() {
      console.log('Set ros param:', key, value)
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
