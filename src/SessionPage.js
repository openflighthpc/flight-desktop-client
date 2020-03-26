import React, { useContext, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import ErrorBoundary from './ErrorBoundary';
import NoVNC from './NoVNC';
import Spinner from './Spinner';
import TerminateButton from './TerminateButton';
import { Context as ConfigContext } from './ConfigContext';
import { DefaultErrorMessage } from './ErrorBoundary';
import { useFetchSession, useTerminateSession } from './api';

function buildWebsocketUrl(session, config) {
  if (config.devOnlyWebsocketRootUrl) {
    // This branch is intended for development and testing only.  The code
    // here is intentionally less robust in the URL it constructs.  It is
    // expected that the developer sets things up correctly.
    const rootUrl = config.devOnlyWebsocketRootUrl;
    const prefix = config.websocketPathPrefix;
    const pathIP = config.websocketPathIp || session.ip;
    return `${rootUrl}${prefix}/${pathIP}/${session.port}`;

  } else {
    const apiUrl = new URL(config.apiRootUrl);
    const wsUrl = new URL(config.apiRootUrl);

    if (apiUrl.protocol.match(/https/)) {
      wsUrl.protocol = 'wss';
    } else {
      wsUrl.protocol = 'ws';
    }

    let prefix = config.websocketPathPrefix;
    const pathIP = config.websocketPathIp || session.ip;
    wsUrl.pathname = `${prefix}/${pathIP}/${session.port}`;

    return wsUrl.toString()
  }
}

function SessionPage() {
  const config = useContext(ConfigContext);
  const { id } = useParams();
  const { del, loading: terminating } = useTerminateSession(id);
  const {
    data: session,
    error: sessionLoadingError,
    loading: sessionLoading,
  } = useFetchSession(id);
  const vnc = useRef(null);
  const [connectionState, setConnectionState] = useState('connecting');
  const history = useHistory();
  const terminateSession = () => {
    setConnectionState('terminating');
    del().then(() => history.push(`/sessions`));
  };
  // `id` could be null when we are navigating away from the page.
  const sessionName = id == null ? '' : id.split('-')[0];

  if (sessionLoading) {
    return (
      <Layout headerText={sessionName}>
        <Spinner text="Loading session..." />
      </Layout>
    );
  } else if (sessionLoadingError) {
    return <DefaultErrorMessage />;
  } else {
    const websocketUrl = buildWebsocketUrl(session, config);
    return (
      <Layout
        connectionState={connectionState}
        headerText={sessionName}
        onDisconnect={() => {
          if (vnc.current) {
            setConnectionState('disconnecting');
            vnc.current.onUserDisconnect();
          }
        }}
        onReconnect={() => {
          if (vnc.current) {
            setConnectionState('connecting');
            vnc.current.onReconnect();
          }
        }}
        onTerminate={terminateSession}
        session={session}
        terminating={terminating}
      >
        <ErrorBoundary>
          <ConnectStateIndicator connectionState={connectionState} />
          <div className={connectionState === 'connected' ? 'd-block' : 'd-none'}>
            <NoVNC
              connectionName={websocketUrl}
              password={session.password}
              onBeforeConnect={() => {
                console.log('connected')
                setConnectionState('connected')
              }}
              onDisconnected={(e) => {
                console.log('disconnected', e);
                setConnectionState('disconnected')
              }}
              ref={vnc}
            />
          </div>
        </ErrorBoundary>
      </Layout>
    );
  }
}

function Layout({
  children,
  connectionState,
  headerText,
  onDisconnect,
  onReconnect,
  onTerminate,
  session,
  terminating,
}) {
  return (
    <div className="overflow-auto">
      <div className="row no-gutters">
        <div className="col">
          <div className="card border-primary">
            <div className="card-header bg-primary text-light">
              <div className="row no-gutters">
                <div className="col">
                  <div className="d-flex align-items-center">
                    <h5 className="flex-grow-1 mb-0">
                      {headerText}
                    </h5>
                    <Toolbar
                      connectionState={connectionState}
                      onDisconnect={onDisconnect}
                      onReconnect={onReconnect}
                      onTerminate={onTerminate}
                      session={session}
                      terminating={terminating}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toolbar({
  connectionState,
  onDisconnect,
  onReconnect,
  onTerminate,
  session,
  terminating,
}) {
  const disconnectBtn = connectionState === 'connected' ? (
    <button
      className="btn btn-secondary btn-sm mr-1"
      onClick={onDisconnect}
    >
      <i className="fa fa-times mr-1"></i>
      <span>Disconnect</span>
    </button>
  ) : null;

  const reconnectBtn = connectionState === 'disconnected' ? (
    <button
      className="btn btn-secondary btn-sm mr-1"
      onClick={onReconnect}
    >
      <i className="fa fa-bolt mr-1"></i>
      <span>Reconnect</span>
    </button>
  ) : null;

  const terminateBtn = session != null ? (
    <TerminateButton
      session={session}
      terminateSession={onTerminate}
      terminating={terminating}
    >
    </TerminateButton>
  ) : null;

  return (
    <div className="btn-toolbar">
      {disconnectBtn}
      {reconnectBtn}
      {terminateBtn}
    </div>
  );
}

function ConnectStateIndicator({ connectionState }) {
  switch (connectionState) {
    case 'connecting':
      return (<Spinner text="Initializing connection..." />);
    case 'disconnecting':
      return (<Spinner text="Disconnecting..." />);
    case 'terminating':
      return (<Spinner text="Terminating..." />);
    case 'disconnected':
      return (<div className="text-center">Session has been disconnected.</div>);
    default:
      return null;
  }
}

export default SessionPage;
