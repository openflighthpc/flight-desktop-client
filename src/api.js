import { useContext, useEffect, useRef, useState } from 'react';
import useFetch from 'use-http';

import { Context as CurrentUserContext } from './CurrentUserContext';

export function useSignIn({ onError }) {
  const {
    error,
    get,
    loading,
    response,
  } = useAuthCheck();
  const { tempUser, actions: userActions } = useContext(CurrentUserContext);

  useEffect(() => {
    async function stuff() {
      if (tempUser) {
        await get();
        if (response.ok) {
          userActions.promoteUser(tempUser);
        } else {
          typeof onError === 'function' && onError(response);
        }
      }
    }
    stuff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ tempUser ]);

  function startSignIn(inputs) {
    userActions.setTempUser(inputs.username, inputs.password);
  }

  return { error, loading, startSignIn };
}

function useAuthCheck() {
  const { tempUser } = useContext(CurrentUserContext);

  return useFetch({
    path: "/ping",
    interceptors: {
      request: async (options, url, path, route) => {
        if (tempUser) {
          if (options.headers == null) { options.headers = {}; }
          options.headers.Authorization = tempUser.authToken;
        }
        return options;
      },
    },
  });
}

export function useFetchSessions() {
  const { currentUser } = useContext(CurrentUserContext);
  return useFetch({
    path: "/sessions",
    headers: { Accept: 'application/json' },
  }, [ currentUser.authToken ]);
}

export function useFetchSession(id) {
  const { currentUser } = useContext(CurrentUserContext);
  return useFetch({ path: `/sessions/${id}` }, [ id, currentUser.authToken ]);
}

export function useLaunchSession(desktop) {
  const request = useFetch({
    method: 'post',
    path: "/sessions",
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: {
      desktop: desktop.type,
    },
    cachePolicy: 'no-cache',
  });
  return request;
}

export function useTerminateSession(id) {
  const request = useFetch({
    method: 'delete',
    path: `/sessions/${id}`,
    cachePolicy: 'no-cache',
  });
  return request;
}

export function useFetchScreenshot(id) {
  const reloadInterval = 1 * 60 * 1000;
  const lastLoadedAt = useRef(null);
  const [ image, setImage ] = useState(null);

  const now = new Date();
  const reloadDue = lastLoadedAt.current == null ||
    now - lastLoadedAt.current < reloadInterval;
  if (reloadDue) {
    lastLoadedAt.current = now;
  }

  const { get, response } = useFetch({
    path: `/sessions/${id}/screenshot`,
    headers: { Accept: 'image/*' },
    cachePolicy: 'cache-first',
    cacheLife: reloadInterval,
    // cachePolicy: 'no-cache',
  }, [lastLoadedAt])

  if (response.ok) {
    response.blob().then((blob) => {
      blob.text().then((newImage) => {
        if (image !== newImage) {
          setImage(newImage);
        }
      });
    });
  }

  return { get, image };
}
