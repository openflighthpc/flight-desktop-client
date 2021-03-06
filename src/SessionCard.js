import * as d3 from "d3-time-format";
import React from 'react';
import classNames from 'classnames';
import { Link } from "react-router-dom";

import CleanButton from './CleanSessionButton';
import WrappedScreenshot from './Screenshot';
import TerminateButton from './TerminateButton';
import { CardFooter } from './CardParts';
import { prettyDesktopName } from './utils';

const timeFormat = d3.timeFormat("%a %e %b %Y %H:%M");

function timestampFormat(timestamp) {
  return timeFormat(new Date(timestamp));
}

function SessionCard({ reload, session }) {
  const sessionName = session.name || session.id.split('-')[0];

  return (
      <div
        className={classNames('card border-primary mb-2', {
          [`session--${session.state.toLowerCase()}`]: true,
        })}
        data-testid="session-card"
      >
        <h5 className="card-header bg-primary text-light">
          {sessionName}
        </h5>
        <div className={
          classNames("card-body", { 'text-muted': session.state !== 'Active' })
        }>
          <div className="row mb-2">
            <div className="col">
              <Screenshot session={session} />
            </div>
          </div>
          <dl className="row">
            <MetadataEntry
              name="Desktop"
              value={
                prettyDesktopName[session.desktop] || session.desktop || <em>Unknown</em>
              }
              valueTitle={
                prettyDesktopName[session.desktop] || session.desktop || 'Unknown'
              }
            />
            <MetadataEntry
              name="State"
              value={session.state}
              valueTitle={
                session.state === 'Active' ?
                  'This session is active.  You can connect to it to gain access.' :
                  'This session is no longer available.  To remove it from ' +
                  'this list, click the "Clean" button below.'
              }
            />
            <MetadataEntry
              name="Started"
              value={session.created_at}
              format={timestampFormat}
            />
            <MetadataEntry
              name="Last accessed"
              value={session.last_accessed_at}
              format={timestampFormat}
            />
          </dl>
        </div>
        <CardFooter>
          <Buttons
            onCleaned={reload}
            onTerminated={reload}
            session={session} 
          />
        </CardFooter>
      </div>
  );
}

function MetadataEntry({ name, value, format, valueTitle }) {
  if (value == null) {
    return null;
  }
  const formatted = typeof format === "function" ? format(value) : value;
  return (
    <React.Fragment>
      <dt
        className="col-sm-4 text-truncate"
        title={name}
      >
        {name}
      </dt>
      <dd
        className="col-sm-8 text-truncate"
        title={valueTitle || formatted}
      >
        {formatted}
      </dd>
    </React.Fragment>
  );
}

function Buttons({ onCleaned, onTerminated, session }) {
  if (session.state === 'Active') {
    return (
      <div className="btn-toolbar justify-content-center">
        <Link
          className="btn btn-sm btn-primary mr-2"
          to={`/sessions/${session.id}`}
        >
          <i className="fa fa-bolt mr-1"></i>
          <span>Connect</span>
        </Link>
        <TerminateButton
          className="btn-sm"
          onTerminated={onTerminated}
          session={session}
        />
      </div>
    );
  } else {
    return (
      <div className="btn-toolbar justify-content-center">
        <CleanButton
          className="btn-sm"
          onCleaned={onCleaned}
          session={session}
        />
      </div>
    );
  }
}

function Screenshot({ session }) {
  const screenshot = <WrappedScreenshot className="card-img" session={session} />;
  if (session.state === 'Active') {
    return <Link to={`/sessions/${session.id}`}>{screenshot}</Link>;
  } else {
    return screenshot;
  }
}

export default SessionCard;
